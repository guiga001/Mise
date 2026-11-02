/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise Atendimento — Gerenciador de Sessões WhatsApp por Restaurante (Baileys)
 * Cada restaurante possui sua própria sessão, QR Code exclusivo e diretório de autenticação isolado.
 */

import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import { WhatsAppConnectionStatus, WhatsAppSessionInfo, WhatsAppMessage } from '../domain/atendimento-types';
import { atendimentoStore } from './atendimento-store';

const SESSIONS_DIR = path.resolve(process.cwd(), 'data', 'whatsapp_sessions');

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

interface CompanySessionState {
  companyId: string;
  socket: WASocket | null;
  status: WhatsAppConnectionStatus;
  phoneNumber?: string;
  profileName?: string;
  profilePicUrl?: string;
  qrCodeDataUrl?: string;
  qrExpiresAt?: string;
  connectedAt?: string;
  lastDisconnectReason?: string;
  batteryLevel?: number;
  qrRaw?: string;
}

export type WhatsAppEventType =
  | 'session_status'
  | 'new_message'
  | 'message_status'
  | 'conversation_updated';

export interface WhatsAppEventPayload {
  type: WhatsAppEventType;
  companyId: string;
  data: any;
}

export class WhatsAppManager {
  private sessions: Map<string, CompanySessionState> = new Map();
  private listeners: Map<string, Set<(event: WhatsAppEventPayload) => void>> = new Map();

  constructor() {
    ensureSessionsDir();
  }

  private getSessionDir(companyId: string): string {
    const safeId = companyId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(SESSIONS_DIR, safeId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  // Obter status atual da sessão
  getSessionInfo(companyId: string): WhatsAppSessionInfo {
    const s = this.sessions.get(companyId);
    if (!s) {
      // Verifica se existem credenciais prévias salvas no disco
      const dir = this.getSessionDir(companyId);
      const credsFile = path.join(dir, 'creds.json');
      const hasSavedCreds = fs.existsSync(credsFile);

      return {
        companyId,
        status: hasSavedCreds ? 'DISCONNECTED' : 'DISCONNECTED',
      };
    }

    return {
      companyId: s.companyId,
      status: s.status,
      phoneNumber: s.phoneNumber,
      profileName: s.profileName,
      profilePicUrl: s.profilePicUrl,
      qrCodeDataUrl: s.qrCodeDataUrl,
      qrExpiresAt: s.qrExpiresAt,
      connectedAt: s.connectedAt,
      lastDisconnectReason: s.lastDisconnectReason,
      batteryLevel: s.batteryLevel,
    };
  }

  // Registrar ouvinte SSE para a empresa
  subscribe(companyId: string, listener: (event: WhatsAppEventPayload) => void): () => void {
    if (!this.listeners.has(companyId)) {
      this.listeners.set(companyId, new Set());
    }
    this.listeners.get(companyId)!.add(listener);

    return () => {
      const set = this.listeners.get(companyId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(companyId);
        }
      }
    };
  }

  private broadcast(companyId: string, type: WhatsAppEventType, data: any) {
    const set = this.listeners.get(companyId);
    if (set) {
      const payload: WhatsAppEventPayload = { type, companyId, data };
      for (const listener of set) {
        try {
          listener(payload);
        } catch (e) {
          console.error(`Erro ao disparar evento para empresa ${companyId}:`, e);
        }
      }
    }
  }

  // Iniciar conexão com WhatsApp via Baileys e gerar QR Code
  async connectSession(companyId: string): Promise<WhatsAppSessionInfo> {
    ensureSessionsDir();
    const sessionDir = this.getSessionDir(companyId);

    // Se já estiver conectado, apenas retorna a sessão
    const existing = this.sessions.get(companyId);
    if (existing?.socket && existing.status === 'CONNECTED') {
      return this.getSessionInfo(companyId);
    }

    // Se já houver um socket iniciando ou aguardando scan, fechar antes de reiniciar
    if (existing?.socket) {
      try {
        existing.socket.end(undefined);
      } catch (e) {}
    }

    const sessionState: CompanySessionState = {
      companyId,
      socket: null,
      status: 'STARTING',
    };
    this.sessions.set(companyId, sessionState);
    this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Mise Atendimento', 'Chrome', '124.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
      });

      sessionState.socket = sock;

      // Evento de salvamento de credenciais
      sock.ev.on('creds.update', saveCreds);

      // Evento de atualização de conexão e QR Code
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          sessionState.qrRaw = qr;
          sessionState.status = 'AWAITING_SCAN';
          sessionState.qrExpiresAt = new Date(Date.now() + 50000).toISOString(); // QR do Baileys dura ~50s

          try {
            sessionState.qrCodeDataUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              scale: 8,
              color: {
                dark: '#0a0a0a',
                light: '#ffffff',
              },
            });
          } catch (qrErr) {
            console.error('Erro ao converter QR code em imagem:', qrErr);
          }

          this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
        }

        if (connection === 'connecting') {
          sessionState.status = sessionState.qrCodeDataUrl ? 'AWAITING_SCAN' : 'CONNECTING';
          this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
        }

        if (connection === 'open') {
          sessionState.status = 'CONNECTED';
          sessionState.qrCodeDataUrl = undefined;
          sessionState.qrRaw = undefined;
          sessionState.connectedAt = new Date().toISOString();

          // Obter dados do usuário conectado
          if (sock.user) {
            const rawId = sock.user.id || '';
            const phone = rawId.split(':')[0] || rawId.split('@')[0];
            sessionState.phoneNumber = phone;
            sessionState.profileName = sock.user.name || undefined;
          }

          console.log(`[Mise Atendimento] WhatsApp conectado para empresa ${companyId} (${sessionState.phoneNumber})`);
          this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(
            `[Mise Atendimento] Conexão encerrada para empresa ${companyId}. Código: ${statusCode}, Reconnect: ${shouldReconnect}`
          );

          sessionState.lastDisconnectReason = `Desconectado (código ${statusCode || 'desconhecido'})`;

          if (statusCode === DisconnectReason.loggedOut) {
            // Sessão deslogada: limpar credenciais do disco
            sessionState.status = 'DISCONNECTED';
            sessionState.socket = null;
            sessionState.phoneNumber = undefined;
            sessionState.qrCodeDataUrl = undefined;
            this.clearSessionDiskFiles(companyId);
            this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
          } else {
            sessionState.status = 'DISCONNECTED';
            sessionState.socket = null;
            this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));

            // Reconexão controlada se não foi logout voluntário
            if (shouldReconnect) {
              setTimeout(() => {
                const current = this.sessions.get(companyId);
                if (current && current.status === 'DISCONNECTED') {
                  this.connectSession(companyId).catch((e) =>
                    console.error(`Erro ao reconectar empresa ${companyId}:`, e)
                  );
                }
              }, 4000);
            }
          }
        }
      });

      // Evento de recebimento de mensagens
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
          if (!msg.message) continue;
          if (msg.key.remoteJid === 'status@broadcast') continue; // Ignora status de contatos

          const remoteJid = msg.key.remoteJid || '';
          if (!remoteJid.endsWith('@s.whatsapp.net')) continue; // Foca em conversas diretas de clientes

          const customerPhone = remoteJid.replace('@s.whatsapp.net', '');
          const customerName = msg.pushName || customerPhone;
          const fromMe = Boolean(msg.key.fromMe);

          // Extrai conteúdo do texto
          let text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            '';

          let messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' = 'TEXT';
          if (msg.message.imageMessage) messageType = 'IMAGE';
          if (msg.message.documentMessage) messageType = 'DOCUMENT';
          if (msg.message.audioMessage) messageType = 'AUDIO';

          if (!text && messageType !== 'TEXT') {
            text = messageType === 'IMAGE' ? 'Foto recebida' : messageType === 'AUDIO' ? 'Áudio de voz' : 'Arquivo';
          }

          // Encontra ou cria a conversa isolada desta empresa
          const conversation = atendimentoStore.findOrCreateConversation(
            companyId,
            customerPhone,
            customerName
          );

          const timestamp = new Date((msg.messageTimestamp as number) * 1000 || Date.now()).toISOString();

          const messageRecord: WhatsAppMessage = {
            id: msg.key.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            conversationId: conversation.id,
            companyId,
            fromMe,
            senderPhone: fromMe ? sessionState.phoneNumber || 'Restaurante' : customerPhone,
            senderName: fromMe ? 'Restaurante' : customerName,
            text,
            type: messageType,
            timestamp,
            status: fromMe ? 'SENT' : 'DELIVERED',
          };

          atendimentoStore.addMessage(companyId, messageRecord);

          // Disparar eventos em tempo real
          this.broadcast(companyId, 'new_message', messageRecord);
          this.broadcast(companyId, 'conversation_updated', conversation);
        }
      });

      return this.getSessionInfo(companyId);
    } catch (err: any) {
      console.error(`Erro ao inicializar sessão Baileys para ${companyId}:`, err);
      sessionState.status = 'ERROR';
      sessionState.lastDisconnectReason = err?.message || 'Falha ao iniciar conexão';
      this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
      return this.getSessionInfo(companyId);
    }
  }

  // Desconectar sessão e limpar credenciais
  async disconnectSession(companyId: string): Promise<WhatsAppSessionInfo> {
    const session = this.sessions.get(companyId);
    if (session?.socket) {
      try {
        await session.socket.logout();
      } catch (e) {
        try {
          session.socket.end(undefined);
        } catch (err) {}
      }
    }

    this.clearSessionDiskFiles(companyId);

    const cleared: CompanySessionState = {
      companyId,
      socket: null,
      status: 'DISCONNECTED',
      lastDisconnectReason: 'Desconectado pelo proprietário',
    };
    this.sessions.set(companyId, cleared);
    this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));

    return this.getSessionInfo(companyId);
  }

  private clearSessionDiskFiles(companyId: string) {
    try {
      const dir = this.getSessionDir(companyId);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
      console.error(`Erro ao limpar pasta de sessão ${companyId}:`, e);
    }
  }

  // Enviar mensagem de texto ou mídia para o WhatsApp do cliente
  async sendMessage(
    companyId: string,
    customerPhone: string,
    text: string,
    authorName?: string,
    authorId?: string
  ): Promise<WhatsAppMessage> {
    const session = this.sessions.get(companyId);
    if (!session?.socket || session.status !== 'CONNECTED') {
      throw new Error(
        'WhatsApp não está conectado para este restaurante. Conecte escaneando o QR Code na aba Conexão.'
      );
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;

    const sent = await session.socket.sendMessage(jid, { text });

    const conversation = atendimentoStore.findOrCreateConversation(companyId, cleanPhone, cleanPhone);
    const now = new Date().toISOString();

    const messageRecord: WhatsAppMessage = {
      id: sent?.key?.id || `msg_${Date.now()}`,
      conversationId: conversation.id,
      companyId,
      fromMe: true,
      senderPhone: session.phoneNumber || 'Restaurante',
      senderName: authorName || 'Restaurante',
      text,
      type: 'TEXT',
      timestamp: now,
      status: 'SENT',
      authorId,
      authorName,
    };

    atendimentoStore.addMessage(companyId, messageRecord);

    this.broadcast(companyId, 'new_message', messageRecord);
    this.broadcast(companyId, 'conversation_updated', conversation);

    return messageRecord;
  }
}

export const whatsappManager = new WhatsAppManager();
