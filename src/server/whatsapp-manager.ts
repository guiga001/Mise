/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise Atendimento — Gerenciador de Sessões WhatsApp por Restaurante (Baileys)
 * Cada restaurante possui sua própria sessão, QR Code exclusivo e diretório de autenticação isolado.
 * Sincroniza automaticamente todo o histórico de conversas, contatos e mensagens ao conectar.
 */

import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  WASocket,
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
  pairingCode?: string;
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
  private cachedVersion: [number, number, number] | null = null;

  constructor() {
    ensureSessionsDir();
    // Auto-restaura sessões que já possuem credenciais ativas em disco
    setTimeout(() => {
      this.autoRestoreSessions();
    }, 1000);
  }

  // Verifica se a empresa possui credenciais autenticadas gravadas em disco
  hasStoredSession(companyId: string): boolean {
    try {
      const safeId = companyId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const dir = path.join(SESSIONS_DIR, safeId);
      const credsFile = path.join(dir, 'creds.json');
      if (fs.existsSync(credsFile)) {
        const content = fs.readFileSync(credsFile, 'utf8');
        return content.includes('"registered":true') || content.includes('"me"');
      }
    } catch {
      return false;
    }
    return false;
  }

  // Auto-restauração de todas as sessões salvas ao inicializar o servidor
  autoRestoreSessions() {
    try {
      if (!fs.existsSync(SESSIONS_DIR)) return;
      const dirs = fs.readdirSync(SESSIONS_DIR);
      for (const d of dirs) {
        const full = path.join(SESSIONS_DIR, d);
        if (fs.statSync(full).isDirectory()) {
          const credsFile = path.join(full, 'creds.json');
          if (fs.existsSync(credsFile)) {
            const hasAuth = this.hasStoredSession(d);
            if (hasAuth && !this.sessions.has(d)) {
              console.log(`[Mise Atendimento] Restaurando automaticamente sessão salva para ${d}...`);
              this.connectSession(d, false).catch((err) =>
                console.warn(`[Mise Atendimento] Falha ao auto-restaurar sessão ${d}:`, err?.message)
              );
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Mise Atendimento] Erro ao escanear sessões para auto-restore:', err);
    }
  }

  private async getBaileysVersion(): Promise<[number, number, number]> {
    if (this.cachedVersion) return this.cachedVersion;
    try {
      const { version } = await fetchLatestBaileysVersion();
      if (Array.isArray(version) && version.length === 3) {
        this.cachedVersion = version as [number, number, number];
        return this.cachedVersion;
      }
    } catch (e) {
      console.warn('[WhatsApp] Falha ao consultar versão mais recente de Baileys, usando versão padrão estável.');
    }
    this.cachedVersion = [2, 3000, 1043857760];
    return this.cachedVersion;
  }

  private getSessionDir(companyId: string): string {
    const safeId = companyId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dir = path.join(SESSIONS_DIR, safeId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private cleanOrphanSessionFiles(companyId: string) {
    try {
      const dir = this.getSessionDir(companyId);
      const credsFile = path.join(dir, 'creds.json');
      // Se não há creds.json, quaisquer outros arquivos residuais (pre-keys, etc.) são órfãos de handshakes anteriores interrompidos
      if (!fs.existsSync(credsFile)) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            fs.rmSync(path.join(dir, file), { recursive: true, force: true });
          }
        }
      }
    } catch (e) {
      console.warn(`[WhatsApp] Aviso ao limpar resíduos de sessão ${companyId}:`, e);
    }
  }

  // Obter status atual da sessão
  getSessionInfo(companyId: string): WhatsAppSessionInfo {
    let s = this.sessions.get(companyId);

    // Se não está em memória mas tem credenciais salvas em disco, auto-reconecta
    if (!s && this.hasStoredSession(companyId)) {
      this.connectSession(companyId, false).catch((err) =>
        console.warn(`[Mise Atendimento] Falha na auto-reconexão para ${companyId}:`, err?.message)
      );
      s = this.sessions.get(companyId);
    }

    if (!s) {
      return {
        companyId,
        status: 'DISCONNECTED',
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
      pairingCode: s.pairingCode,
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

  // Processar mensagem histórica ou em tempo real e armazenar no banco
  private processHistoricalMessage(
    companyId: string,
    msg: any,
    sessionState: CompanySessionState
  ) {
    if (!msg || !msg.key) return;
    const remoteJid = msg.key.remoteJid || '';
    if (!remoteJid || remoteJid === 'status@broadcast') return;
    if (!remoteJid.endsWith('@s.whatsapp.net') && !remoteJid.endsWith('@g.us')) return;

    const isGroup = remoteJid.endsWith('@g.us');
    const cleanPhone = isGroup ? remoteJid : remoteJid.replace('@s.whatsapp.net', '');
    const customerName = msg.pushName || cleanPhone;
    const fromMe = Boolean(msg.key.fromMe);

    // Extrai conteúdo do texto
    let text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    let messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' = 'TEXT';
    if (msg.message?.imageMessage) messageType = 'IMAGE';
    if (msg.message?.documentMessage) messageType = 'DOCUMENT';
    if (msg.message?.audioMessage) messageType = 'AUDIO';

    if (!text && messageType !== 'TEXT') {
      text = messageType === 'IMAGE' ? 'Foto recebida' : messageType === 'AUDIO' ? 'Áudio de voz' : 'Arquivo';
    }

    if (!text && !msg.message) return;

    const conversation = atendimentoStore.findOrCreateConversation(
      companyId,
      cleanPhone,
      customerName
    );

    const rawTs =
      typeof msg.messageTimestamp === 'object' && msg.messageTimestamp?.low
        ? msg.messageTimestamp.low
        : Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000);
    const timestamp = new Date(rawTs > 1e11 ? rawTs : rawTs * 1000).toISOString();

    const messageRecord: WhatsAppMessage = {
      id: msg.key.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: conversation.id,
      companyId,
      fromMe,
      senderPhone: fromMe ? sessionState.phoneNumber || 'Restaurante' : cleanPhone,
      senderName: fromMe ? 'Restaurante' : customerName,
      text: text || 'Mensagem',
      type: messageType,
      timestamp,
      status: fromMe ? 'SENT' : 'DELIVERED',
    };

    atendimentoStore.addMessage(companyId, messageRecord);
  }

  // Vincular listeners comuns de evento ao socket Baileys
  private bindSocketEvents(
    sock: WASocket,
    companyId: string,
    sessionState: CompanySessionState,
    saveCreds: () => Promise<void>
  ) {
    // 1. Atualização e persistência de credenciais criptografadas
    sock.ev.on('creds.update', saveCreds);

    // 2. Atualização de estado da conexão e QR Code
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        sessionState.qrRaw = qr;
        sessionState.status = 'AWAITING_SCAN';
        sessionState.qrExpiresAt = new Date(Date.now() + 60000).toISOString();

        try {
          sessionState.qrCodeDataUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: 'M',
            margin: 3,
            scale: 8,
            color: {
              dark: '#000000',
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
        sessionState.pairingCode = undefined;
        sessionState.connectedAt = new Date().toISOString();

        if (sock.user) {
          const rawId = sock.user.id || '';
          const phone = rawId.split(':')[0] || rawId.split('@')[0];
          sessionState.phoneNumber = phone;
          sessionState.profileName = sock.user.name || undefined;
        }

        console.log(
          `[Mise Atendimento] WhatsApp conectado com sucesso para restaurante ${companyId} (${sessionState.phoneNumber})`
        );
        this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
        this.broadcast(companyId, 'conversation_updated', { connected: true });
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        const isRestartRequired = statusCode === DisconnectReason.restartRequired || statusCode === 515;

        console.log(
          `[Mise Atendimento] Conexão encerrada para restaurante ${companyId}. Código: ${statusCode}, isLoggedOut: ${isLoggedOut}, isRestartRequired: ${isRestartRequired}, statusAtual: ${sessionState.status}`
        );

        sessionState.lastDisconnectReason = `Desconectado (código ${statusCode || 'fechamento normal'})`;
        sessionState.socket = null;

        if (isLoggedOut) {
          sessionState.status = 'DISCONNECTED';
          sessionState.phoneNumber = undefined;
          sessionState.qrCodeDataUrl = undefined;
          sessionState.qrRaw = undefined;
          sessionState.pairingCode = undefined;
          this.clearSessionDiskFiles(companyId);
          this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
        } else {
          // Se não foi logout explícito, nós DEVEMOS reconectar!
          // Especialmente se o código for DisconnectReason.restartRequired (515), que o WhatsApp
          // envia logo após a leitura do QR Code ou confirmação do Pairing Code no celular.
          if (isRestartRequired) {
            console.log(
              `[Mise Atendimento] Pareamento confirmado pelo celular para ${companyId}. Reconectando para autenticação imediata...`
            );
            sessionState.status = 'CONNECTING';
            sessionState.qrCodeDataUrl = undefined;
            sessionState.qrRaw = undefined;
            sessionState.pairingCode = undefined;
            this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));

            // Reconexão imediata com as novas credenciais salvas em disco
            setTimeout(() => {
              this.connectSession(companyId, false).catch((e) =>
                console.error(`Erro ao autenticar sessão pós-pareamento para ${companyId}:`, e)
              );
            }, 600);
          } else {
            // Queda temporária de rede ou timeout
            const wasConnected = sessionState.status === 'CONNECTED';
            sessionState.status = wasConnected ? 'CONNECTING' : sessionState.status;
            this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));

            setTimeout(() => {
              const current = this.sessions.get(companyId);
              if (current && (current.status === 'CONNECTING' || current.status === 'DISCONNECTED')) {
                this.connectSession(companyId, false).catch((e) =>
                  console.error(`Erro ao auto-reconectar empresa ${companyId}:`, e)
                );
              }
            }, 2500);
          }
        }
      }
    });

    // 3. Sincronização Completa de Histórico de Conversas e Mensagens (messaging-history.set)
    sock.ev.on('messaging-history.set', ({ chats, contacts, messages }) => {
      console.log(
        `[Mise Atendimento] Sincronizando histórico para restaurante ${companyId}: ${chats?.length || 0} conversas, ${contacts?.length || 0} contatos, ${messages?.length || 0} mensagens.`
      );

      // Mapa de nomes de contatos para enriquecer conversas
      const contactNameMap = new Map<string, string>();
      if (Array.isArray(contacts)) {
        for (const contact of contacts) {
          if (contact.id) {
            const name = contact.name || contact.notify || contact.verifiedName;
            if (name) {
              const phone = contact.id.replace('@s.whatsapp.net', '');
              contactNameMap.set(phone, name);
            }
          }
        }
      }

      // Pré-cadastrar conversas a partir dos chats retornados pelo WhatsApp
      if (Array.isArray(chats)) {
        for (const chat of chats) {
          if (!chat.id || chat.id === 'status@broadcast') continue;
          if (!chat.id.endsWith('@s.whatsapp.net') && !chat.id.endsWith('@g.us')) continue;
          const phone = chat.id.replace('@s.whatsapp.net', '');
          const name = chat.name || contactNameMap.get(phone) || phone;
          atendimentoStore.findOrCreateConversation(companyId, phone, name);
        }
      }

      // Inserir mensagens históricas ordenadas cronologicamente
      if (Array.isArray(messages)) {
        const sorted = [...messages].sort((a, b) => {
          const tsA = Number(a.messageTimestamp) || 0;
          const tsB = Number(b.messageTimestamp) || 0;
          return tsA - tsB;
        });

        for (const msg of sorted) {
          this.processHistoricalMessage(companyId, msg, sessionState);
        }
      }

      // Notificar frontend via SSE para carregar a lista de conversas preenchida instantaneamente
      this.broadcast(companyId, 'conversation_updated', { synced: true });
    });

    // 4. Upsert de chats quando novos tópicos são sincronizados
    sock.ev.on('chats.upsert', (chats) => {
      for (const chat of chats) {
        if (!chat.id || chat.id === 'status@broadcast') continue;
        if (!chat.id.endsWith('@s.whatsapp.net')) continue;
        const phone = chat.id.replace('@s.whatsapp.net', '');
        const name = chat.name || phone;
        atendimentoStore.findOrCreateConversation(companyId, phone, name);
      }
      this.broadcast(companyId, 'conversation_updated', { synced: true });
    });

    // 5. Recebimento de mensagens em tempo real
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message) continue;
        if (msg.key.remoteJid === 'status@broadcast') continue;

        const remoteJid = msg.key.remoteJid || '';
        if (
          !remoteJid.endsWith('@s.whatsapp.net') &&
          !remoteJid.endsWith('@g.us') &&
          !remoteJid.endsWith('@lid')
        ) {
          continue;
        }

        const isGroup = remoteJid.endsWith('@g.us');
        const customerPhone = isGroup
          ? remoteJid
          : remoteJid.replace('@s.whatsapp.net', '').replace('@lid', '');
        const customerName = msg.pushName || customerPhone;
        const fromMe = Boolean(msg.key.fromMe);

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

        this.broadcast(companyId, 'new_message', messageRecord);
        this.broadcast(companyId, 'conversation_updated', conversation);
      }
    });
  }

  // Iniciar conexão com WhatsApp via Baileys e gerar QR Code
  async connectSession(companyId: string, forceNew = false): Promise<WhatsAppSessionInfo> {
    ensureSessionsDir();
    const existing = this.sessions.get(companyId);

    // Se forceNew for solicitado, encerra obrigatoriamente qualquer socket ativo e limpa os arquivos
    if (forceNew) {
      if (existing?.socket) {
        try {
          existing.socket.end(undefined);
        } catch (e) {}
      }
      this.clearSessionDiskFiles(companyId);
      this.sessions.delete(companyId);
    } else {
      // Se não for forçado e já estiver conectado, apenas retorna a sessão
      if (existing?.socket && existing.status === 'CONNECTED') {
        return this.getSessionInfo(companyId);
      }

      // Se não for forçado e já temos um QR code ativo aguardando scan com imagem pronta, retorna o existente sem reiniciar o handshake
      if (existing?.socket && existing.status === 'AWAITING_SCAN' && existing.qrCodeDataUrl) {
        return this.getSessionInfo(companyId);
      }

      this.cleanOrphanSessionFiles(companyId);
    }

    const sessionDir = this.getSessionDir(companyId);

    // Se houver um socket prévio aberto em memória, fecha com segurança antes de recriar
    const prev = this.sessions.get(companyId);
    if (prev?.socket) {
      try {
        prev.socket.end(undefined);
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
      const version = await this.getBaileysVersion();

      const sock = makeWASocket({
        auth: state,
        version,
        browser: Browsers.macOS('Desktop'),
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        syncFullHistory: false, // CRÍTICO: false evita carregamento infinito no celular
        generateHighQualityLinkPreview: false,
        markOnlineOnConnect: true,
        getMessage: async (key) => {
          if (key?.id) {
            const msg = atendimentoStore.getMessageById(companyId, key.id);
            if (msg) {
              return {
                conversation: msg.text,
              };
            }
          }
          return {
            conversation: '',
          };
        },
      });

      sessionState.socket = sock;
      this.bindSocketEvents(sock, companyId, sessionState, saveCreds);

      // Aguarda até o QR Code DataURL ser devidamente gerado e transformado em imagem base64
      await new Promise<void>((resolve) => {
        let isDone = false;
        const complete = () => {
          if (!isDone) {
            isDone = true;
            resolve();
          }
        };

        // Polling rápido (a cada 80ms) para detectar o instante exato em que qrCodeDataUrl foi gerado
        const checkInterval = setInterval(() => {
          if (sessionState.qrCodeDataUrl || sessionState.status === 'CONNECTED' || sessionState.status === 'ERROR') {
            clearInterval(checkInterval);
            complete();
          }
        }, 80);

        const updateListener = (update: any) => {
          if (sessionState.qrCodeDataUrl || update.connection === 'open') {
            clearInterval(checkInterval);
            sock.ev.off('connection.update', updateListener);
            complete();
          }
        };

        sock.ev.on('connection.update', updateListener);
        setTimeout(() => {
          clearInterval(checkInterval);
          sock.ev.off('connection.update', updateListener);
          complete();
        }, 6500);
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

  // Solicitar código de pareamento numérico (Pairing Code) de 8 dígitos
  async requestPairingCode(companyId: string, phoneNumber: string): Promise<string> {
    // Normalização estrita do número
    let clean = phoneNumber.replace(/\D/g, '');
    if ((clean.length === 10 || clean.length === 11) && !clean.startsWith('55')) {
      clean = `55${clean}`;
    }

    if (!clean || clean.length < 10) {
      throw new Error('Informe um número de telefone válido com DDD (ex: 81999998888 ou 5581999998888).');
    }

    // Fecha qualquer conexão prévia para evitar conflito de handshake
    const existing = this.sessions.get(companyId);
    if (existing?.socket) {
      try {
        existing.socket.end(undefined);
      } catch (e) {}
    }

    // Limpa credenciais locais para garantir creds.registered = false
    this.clearSessionDiskFiles(companyId);

    const sessionDir = this.getSessionDir(companyId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const version = await this.getBaileysVersion();

    const sessionState: CompanySessionState = {
      companyId,
      socket: null,
      status: 'STARTING',
    };
    this.sessions.set(companyId, sessionState);
    this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));

    const sock = makeWASocket({
      auth: state,
      version,
      browser: Browsers.macOS('Desktop'),
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      syncFullHistory: false, // CRÍTICO: false evita carregamento infinito no celular
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: true,
      getMessage: async (key) => {
        if (key?.id) {
          const msg = atendimentoStore.getMessageById(companyId, key.id);
          if (msg) {
            return {
              conversation: msg.text,
            };
          }
        }
        return {
          conversation: '',
        };
      },
    });

    sessionState.socket = sock;
    this.bindSocketEvents(sock, companyId, sessionState, saveCreds);

    // Aguarda o handshake estar pronto antes de chamar requestPairingCode
    return new Promise<string>((resolve, reject) => {
      let resolved = false;
      let timer: NodeJS.Timeout | null = null;

      const triggerPairing = async () => {
        if (resolved) return;
        try {
          if (!sock.authState.creds.registered) {
            const rawCode = await sock.requestPairingCode(clean);
            if (!resolved) {
              resolved = true;
              if (timer) clearTimeout(timer);
              const formatted =
                rawCode && rawCode.length === 8 ? `${rawCode.slice(0, 4)}-${rawCode.slice(4)}` : rawCode;
              sessionState.pairingCode = formatted;
              sessionState.status = 'AWAITING_SCAN';
              this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
              resolve(formatted);
            }
          }
        } catch (err: any) {
          console.warn(`[Mise Atendimento] Tentativa de pareamento ${companyId}: ${err?.message}`);
          if (!resolved) {
            // Tenta uma segunda vez após 1.5 segundos se for fechamento temporário
            setTimeout(async () => {
              if (resolved) return;
              try {
                const retryCode = await sock.requestPairingCode(clean);
                resolved = true;
                if (timer) clearTimeout(timer);
                const formatted =
                  retryCode && retryCode.length === 8 ? `${retryCode.slice(0, 4)}-${retryCode.slice(4)}` : retryCode;
                sessionState.pairingCode = formatted;
                sessionState.status = 'AWAITING_SCAN';
                this.broadcast(companyId, 'session_status', this.getSessionInfo(companyId));
                resolve(formatted);
              } catch (secondErr: any) {
                resolved = true;
                if (timer) clearTimeout(timer);
                reject(
                  new Error(
                    secondErr?.message ||
                      'Não foi possível obter o código de pareamento. Verifique se o número possui WhatsApp ativo.'
                  )
                );
              }
            }, 1500);
          }
        }
      };

      // Dispara quando o evento de conexão indicar que o handshake foi iniciado
      const onConnectionUpdate = (update: any) => {
        if (update.qr || update.connection === 'connecting') {
          sock.ev.off('connection.update', onConnectionUpdate);
          setTimeout(triggerPairing, 800);
        }
      };

      sock.ev.on('connection.update', onConnectionUpdate);

      // Fallback timer de 2s caso os eventos já tenham passado
      setTimeout(triggerPairing, 2000);

      // Timeout máximo de 25s
      timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          sock.ev.off('connection.update', onConnectionUpdate);
          reject(
            new Error(
              'Tempo esgotado ao contatar o WhatsApp. Verifique sua conexão e confirme se o número informado está correto.'
            )
          );
        }
      }, 25000);
    });
  }

  // Desconectar sessão e limpar credenciais instantaneamente
  async disconnectSession(companyId: string): Promise<WhatsAppSessionInfo> {
    const session = this.sessions.get(companyId);
    if (session?.socket) {
      try {
        // Encerramento com timeout rápido para não travar a requisição HTTP
        await Promise.race([
          session.socket.logout().catch(() => {}),
          new Promise((r) => setTimeout(r, 1200)),
        ]);
      } catch (e) {}

      try {
        session.socket.end(undefined);
      } catch (e) {}
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
    targetPhoneOrJid: string,
    text: string,
    conversationId?: string,
    authorName?: string,
    authorId?: string
  ): Promise<WhatsAppMessage> {
    let session = this.sessions.get(companyId);

    // Se a sessão não estiver ativa em memória, tenta auto-conectar caso haja credenciais salvas em disco
    if ((!session?.socket || session.status !== 'CONNECTED') && this.hasStoredSession(companyId)) {
      console.log(`[Mise Atendimento] Restaurando sessão em disco antes do envio para ${companyId}...`);
      await this.connectSession(companyId, false);
      // Aguarda até 3 segundos pela transição para CONNECTED
      let waits = 0;
      while (waits < 6) {
        await new Promise((r) => setTimeout(r, 500));
        session = this.sessions.get(companyId);
        if (session?.status === 'CONNECTED' && session.socket) break;
        waits++;
      }
    }

    if (!session?.socket || session.status !== 'CONNECTED') {
      throw new Error(
        'WhatsApp não está conectado para este restaurante. Conecte escaneando o QR Code na aba Conexão.'
      );
    }

    // Identificação precisa do JID de destino:
    // 1. Grupos mantêm formato original (ex: 120363407009315697@g.us ou 5521982730011-1464784580@g.us)
    // 2. JIDs já formatados (@s.whatsapp.net ou @lid)
    // 3. Telefones limpos com acréscimo do DDI 55 caso necessário
    const rawTarget = targetPhoneOrJid.trim();
    let jid = '';

    if (rawTarget.endsWith('@g.us') || rawTarget.endsWith('@s.whatsapp.net') || rawTarget.endsWith('@lid')) {
      jid = rawTarget;
    } else {
      let clean = rawTarget.replace(/\D/g, '');
      if ((clean.length === 10 || clean.length === 11) && !clean.startsWith('55')) {
        clean = `55${clean}`;
      }
      jid = `${clean}@s.whatsapp.net`;
    }

    console.log(`[Mise Atendimento] Enviando mensagem WhatsApp para ${jid}...`);
    const sent = await session.socket.sendMessage(jid, { text });

    // Determina o ID de conversa correto
    let convId = conversationId;
    if (!convId) {
      const conv = atendimentoStore.findOrCreateConversation(companyId, rawTarget, rawTarget);
      convId = conv.id;
    }

    const now = new Date().toISOString();
    const messageRecord: WhatsAppMessage = {
      id: sent?.key?.id || `msg_${Date.now()}`,
      conversationId: convId,
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

    const conv = atendimentoStore.getConversation(companyId, convId);
    this.broadcast(companyId, 'new_message', messageRecord);
    if (conv) {
      this.broadcast(companyId, 'conversation_updated', conv);
    }

    return messageRecord;
  }
}

export const whatsappManager = new WhatsAppManager();
