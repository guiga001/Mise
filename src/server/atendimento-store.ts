/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise Atendimento — Armazenamento Persistente com Isolamento Estrito por Empresa
 * Salva conversas, mensagens, tags, notas internas e respostas rápidas em ./data/atendimento/[companyId].json
 */

import fs from 'fs';
import path from 'path';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  AtendimentoTag,
  QuickReply,
  InternalNote,
  AtendimentoMetrics,
  ConversationStatus,
} from '../domain/atendimento-types';

interface CompanyAtendimentoData {
  companyId: string;
  conversations: WhatsAppConversation[];
  messages: Record<string, WhatsAppMessage[]>; // conversationId -> messages
  tags: AtendimentoTag[];
  quickReplies: QuickReply[];
  internalNotes: Record<string, InternalNote[]>; // conversationId -> notes
}

const DATA_DIR = path.resolve(process.cwd(), 'data', 'atendimento');

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getCompanyFilePath(companyId: string): string {
  const safeId = companyId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${safeId}.json`);
}

function createDefaultData(companyId: string): CompanyAtendimentoData {
  const now = new Date().toISOString();
  return {
    companyId,
    conversations: [],
    messages: {},
    tags: [
      { id: `tag_novo_${Date.now()}`, companyId, name: 'Novo Cliente', color: '#0284c7', description: 'Primeiro contato' },
      { id: `tag_pedido_${Date.now() + 1}`, companyId, name: 'Pedido em Andamento', color: '#ea580c', description: 'Cozinha preparando' },
      { id: `tag_pag_${Date.now() + 2}`, companyId, name: 'Aguardando Pagamento', color: '#d97706', description: 'Pix ou link pendente' },
      { id: `tag_entrega_${Date.now() + 3}`, companyId, name: 'Saiu para Entrega', color: '#7c3aed', description: 'Com entregador' },
      { id: `tag_vip_${Date.now() + 4}`, companyId, name: 'Cliente Recorrente VIP', color: '#16a34a', description: 'Cliente fiel' },
      { id: `tag_duvida_${Date.now() + 5}`, companyId, name: 'Dúvida / Reclamação', color: '#dc2626', description: 'Atenção especial' },
    ],
    quickReplies: [
      {
        id: `qr_1_${Date.now()}`,
        companyId,
        shortcut: 'ola',
        title: 'Boas-vindas Padrão',
        category: 'Boas-vindas',
        content: 'Olá! Seja muito bem-vindo ao nosso restaurante. Como podemos te ajudar hoje?',
        usageCount: 0,
        createdAt: now,
      },
      {
        id: `qr_2_${Date.now()}`,
        companyId,
        shortcut: 'cardapio',
        title: 'Envio de Cardápio',
        category: 'Cardápio',
        content: 'Você pode conferir nosso cardápio completo, opções artesanais e sobremesas da casa! Qual delícia você gostaria de pedir hoje?',
        usageCount: 0,
        createdAt: now,
      },
      {
        id: `qr_3_${Date.now()}`,
        companyId,
        shortcut: 'preparo',
        title: 'Pedido Confirmado em Preparo',
        category: 'Pedidos',
        content: 'Seu pedido foi confirmado! Nossa cozinha já iniciou o preparo dos ingredientes com todo o capricho.',
        usageCount: 0,
        createdAt: now,
      },
      {
        id: `qr_4_${Date.now()}`,
        companyId,
        shortcut: 'entrega',
        title: 'Saiu para Entrega',
        category: 'Entrega',
        content: 'Boas notícias! Seu pedido acabou de sair para entrega. O entregador chegará em breve ao seu endereço.',
        usageCount: 0,
        createdAt: now,
      },
      {
        id: `qr_5_${Date.now()}`,
        companyId,
        shortcut: 'obrigado',
        title: 'Agradecimento Pós-Pedido',
        category: 'Finalização',
        content: 'Agradecemos muito pela preferência! Esperamos que sua experiência gastronômica tenha sido incrível. Qualquer feedback é bem-vindo!',
        usageCount: 0,
        createdAt: now,
      },
    ],
    internalNotes: {},
  };
}

export class AtendimentoStore {
  private cache: Map<string, CompanyAtendimentoData> = new Map();

  constructor() {
    ensureDirectoryExists();
  }

  private load(companyId: string): CompanyAtendimentoData {
    if (this.cache.has(companyId)) {
      return this.cache.get(companyId)!;
    }

    const filePath = getCompanyFilePath(companyId);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        this.cache.set(companyId, data);
        return data;
      } catch (err) {
        console.error(`Erro ao carregar dados de atendimento para empresa ${companyId}:`, err);
      }
    }

    const initial = createDefaultData(companyId);
    this.save(initial);
    return initial;
  }

  private save(data: CompanyAtendimentoData): void {
    ensureDirectoryExists();
    this.cache.set(data.companyId, data);
    const filePath = getCompanyFilePath(data.companyId);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Erro ao salvar arquivo de atendimento para empresa ${data.companyId}:`, err);
    }
  }

  // Conversas
  getConversations(companyId: string, filter?: {
    status?: ConversationStatus | 'ALL';
    assignedUserId?: string;
    tagId?: string;
    search?: string;
  }): WhatsAppConversation[] {
    const data = this.load(companyId);
    let list = [...data.conversations];

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter?.assignedUserId) {
      if (filter.assignedUserId === 'UNASSIGNED') {
        list = list.filter((c) => !c.assignedUserId);
      } else {
        list = list.filter((c) => c.assignedUserId === filter.assignedUserId);
      }
    }
    if (filter?.tagId) {
      list = list.filter((c) => c.tags.includes(filter.tagId!));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.customerPhone.includes(q) ||
          c.lastMessageText.toLowerCase().includes(q)
      );
    }

    // Ordenar pelas mais recentes primeiro
    list.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    return list;
  }

  getConversation(companyId: string, conversationId: string): WhatsAppConversation | undefined {
    const data = this.load(companyId);
    return data.conversations.find((c) => c.id === conversationId);
  }

  findOrCreateConversation(
    companyId: string,
    customerPhone: string,
    customerName: string,
    avatarUrl?: string
  ): WhatsAppConversation {
    const data = this.load(companyId);
    const id = `${companyId}_${customerPhone.replace(/[^0-9]/g, '')}`;
    let conv = data.conversations.find((c) => c.id === id);

    if (!conv) {
      const now = new Date().toISOString();
      conv = {
        id,
        companyId,
        customerPhone,
        customerName: customerName || customerPhone,
        customerAvatarUrl: avatarUrl,
        unreadCount: 0,
        lastMessageText: '',
        lastMessageTimestamp: now,
        lastMessageDirection: 'INBOUND',
        status: 'OPEN',
        tags: [],
        firstContactAt: now,
        updatedAt: now,
      };
      data.conversations.unshift(conv);
      this.save(data);
    } else {
      if (customerName && conv.customerName === customerPhone) {
        conv.customerName = customerName;
      }
      if (avatarUrl && !conv.customerAvatarUrl) {
        conv.customerAvatarUrl = avatarUrl;
      }
      this.save(data);
    }

    return conv;
  }

  updateConversation(companyId: string, conversationId: string, updates: Partial<WhatsAppConversation>): WhatsAppConversation | null {
    const data = this.load(companyId);
    const index = data.conversations.findIndex((c) => c.id === conversationId);
    if (index === -1) return null;

    data.conversations[index] = {
      ...data.conversations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save(data);
    return data.conversations[index];
  }

  // Mensagens
  getMessages(companyId: string, conversationId: string): WhatsAppMessage[] {
    const data = this.load(companyId);
    const list = data.messages[conversationId] || [];
    return [...list].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addMessage(companyId: string, message: WhatsAppMessage): WhatsAppMessage {
    const data = this.load(companyId);
    if (!data.messages[message.conversationId]) {
      data.messages[message.conversationId] = [];
    }

    // Evitar mensagens duplicadas por ID
    const exists = data.messages[message.conversationId].some((m) => m.id === message.id);
    if (exists) {
      return message;
    }

    data.messages[message.conversationId].push(message);

    // Atualiza resumo da conversa
    const convIndex = data.conversations.findIndex((c) => c.id === message.conversationId);
    if (convIndex !== -1) {
      const conv = data.conversations[convIndex];
      if (!message.isInternalNote) {
        conv.lastMessageText = message.text || (message.type === 'IMAGE' ? '📷 Imagem' : '📎 Arquivo');
        conv.lastMessageTimestamp = message.timestamp;
        conv.lastMessageDirection = message.fromMe ? 'OUTBOUND' : 'INBOUND';
        if (!message.fromMe) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
      conv.updatedAt = new Date().toISOString();
    }

    this.save(data);
    return message;
  }

  markMessagesAsRead(companyId: string, conversationId: string): void {
    const data = this.load(companyId);
    const conv = data.conversations.find((c) => c.id === conversationId);
    if (conv && conv.unreadCount > 0) {
      conv.unreadCount = 0;
      conv.updatedAt = new Date().toISOString();
      this.save(data);
    }
  }

  // Notas Internas
  getInternalNotes(companyId: string, conversationId: string): InternalNote[] {
    const data = this.load(companyId);
    return data.internalNotes[conversationId] || [];
  }

  addInternalNote(companyId: string, note: InternalNote): InternalNote {
    const data = this.load(companyId);
    if (!data.internalNotes[note.conversationId]) {
      data.internalNotes[note.conversationId] = [];
    }
    data.internalNotes[note.conversationId].push(note);

    // Também adiciona no histórico de mensagens com flag isInternalNote para renderização inline
    this.addMessage(companyId, {
      id: note.id,
      conversationId: note.conversationId,
      companyId,
      fromMe: true,
      senderPhone: 'interno',
      senderName: note.authorName,
      text: note.content,
      type: 'INTERNAL_NOTE',
      timestamp: note.createdAt,
      status: 'READ',
      isInternalNote: true,
      authorId: note.authorId,
      authorName: note.authorName,
    });

    this.save(data);
    return note;
  }

  // Etiquetas
  getTags(companyId: string): AtendimentoTag[] {
    const data = this.load(companyId);
    return data.tags;
  }

  saveTag(companyId: string, tag: AtendimentoTag): AtendimentoTag {
    const data = this.load(companyId);
    const idx = data.tags.findIndex((t) => t.id === tag.id);
    if (idx !== -1) {
      data.tags[idx] = tag;
    } else {
      data.tags.push(tag);
    }
    this.save(data);
    return tag;
  }

  deleteTag(companyId: string, tagId: string): boolean {
    const data = this.load(companyId);
    data.tags = data.tags.filter((t) => t.id !== tagId);
    // Remove de todas as conversas
    for (const c of data.conversations) {
      c.tags = c.tags.filter((id) => id !== tagId);
    }
    this.save(data);
    return true;
  }

  // Respostas Rápidas
  getQuickReplies(companyId: string): QuickReply[] {
    const data = this.load(companyId);
    return data.quickReplies;
  }

  saveQuickReply(companyId: string, qr: QuickReply): QuickReply {
    const data = this.load(companyId);
    const idx = data.quickReplies.findIndex((q) => q.id === qr.id);
    if (idx !== -1) {
      data.quickReplies[idx] = qr;
    } else {
      data.quickReplies.push(qr);
    }
    this.save(data);
    return qr;
  }

  deleteQuickReply(companyId: string, id: string): boolean {
    const data = this.load(companyId);
    data.quickReplies = data.quickReplies.filter((q) => q.id !== id);
    this.save(data);
    return true;
  }

  incrementQuickReplyUsage(companyId: string, id: string): void {
    const data = this.load(companyId);
    const qr = data.quickReplies.find((q) => q.id === id);
    if (qr) {
      qr.usageCount = (qr.usageCount || 0) + 1;
      this.save(data);
    }
  }

  // Métricas e Indicadores
  getMetrics(companyId: string): AtendimentoMetrics {
    const data = this.load(companyId);
    const total = data.conversations.length;
    const open = data.conversations.filter((c) => c.status === 'OPEN').length;
    const inProgress = data.conversations.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = data.conversations.filter((c) => c.status === 'RESOLVED').length;
    const unreadCount = data.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    // Contagem por atendente
    const attendantMap: Record<string, { userName: string; count: number }> = {};
    for (const c of data.conversations) {
      const uId = c.assignedUserId || 'UNASSIGNED';
      const uName = c.assignedUserName || 'Sem Atendente';
      if (!attendantMap[uId]) {
        attendantMap[uId] = { userName: uName, count: 0 };
      }
      attendantMap[uId].count++;
    }

    const conversationsByAttendant = Object.entries(attendantMap).map(([userId, val]) => ({
      userId,
      userName: val.userName,
      count: val.count,
    }));

    // Contagem por etiqueta
    const tagMap: Record<string, number> = {};
    for (const c of data.conversations) {
      for (const tId of c.tags) {
        tagMap[tId] = (tagMap[tId] || 0) + 1;
      }
    }

    const conversationsByTag = data.tags.map((t) => ({
      tagId: t.id,
      tagName: t.name,
      color: t.color,
      count: tagMap[t.id] || 0,
    }));

    // Tempo médio de resposta estimado (em minutos) com base nas conversas
    let totalResponseMinutes = 0;
    let responseCount = 0;

    for (const c of data.conversations) {
      const msgs = data.messages[c.id] || [];
      const firstInbound = msgs.find((m) => !m.fromMe && !m.isInternalNote);
      if (firstInbound) {
        const firstOutboundAfter = msgs.find(
          (m) => m.fromMe && !m.isInternalNote && new Date(m.timestamp) > new Date(firstInbound.timestamp)
        );
        if (firstOutboundAfter) {
          const diffMs = new Date(firstOutboundAfter.timestamp).getTime() - new Date(firstInbound.timestamp).getTime();
          const diffMins = Math.round(diffMs / 60000);
          totalResponseMinutes += diffMins;
          responseCount++;
        }
      }
    }

    const avgMins = responseCount > 0 ? Math.round(totalResponseMinutes / responseCount) : 0;

    return {
      totalConversations: total,
      openConversations: open,
      inProgressConversations: inProgress,
      resolvedConversations: resolved,
      unreadMessagesCount: unreadCount,
      averageFirstResponseTimeMinutes: avgMins,
      conversationsByAttendant,
      conversationsByTag,
    };
  }
}

export const atendimentoStore = new AtendimentoStore();
