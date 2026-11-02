/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise Atendimento — Router Express com Validação Estrita de Isolamento por Empresa
 */

import { Router, Request, Response } from 'express';
import { whatsappManager } from './whatsapp-manager';
import { atendimentoStore } from './atendimento-store';

export const atendimentoRouter = Router();

// Middleware para extrair e validar o companyId do restaurante
function getCompanyId(req: Request): string {
  const companyId =
    (req.headers['x-company-id'] as string) ||
    (req.query.companyId as string) ||
    req.body?.companyId;

  if (!companyId || typeof companyId !== 'string' || !companyId.trim()) {
    throw new Error('Identificação da empresa (companyId) não informada na requisição.');
  }

  return companyId.trim();
}

// 1. Status da Sessão WhatsApp
atendimentoRouter.get('/session', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const sessionInfo = whatsappManager.getSessionInfo(companyId);
    res.json(sessionInfo);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao consultar sessão' });
  }
});

// 2. Conectar WhatsApp & Gerar QR Code
atendimentoRouter.post('/session/connect', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const forceNew = Boolean(req.body?.forceNew);
    const sessionInfo = await whatsappManager.connectSession(companyId, forceNew);
    res.json(sessionInfo);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao iniciar conexão WhatsApp' });
  }
});

// 2.1 Gerar Código de Pareamento Numérico (Pairing Code)
atendimentoRouter.post('/session/pairing-code', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Número de telefone é obrigatório para gerar o código de pareamento.' });
    }
    const code = await whatsappManager.requestPairingCode(companyId, phoneNumber);
    const sessionInfo = whatsappManager.getSessionInfo(companyId);
    res.json({ code, sessionInfo });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao gerar código de pareamento' });
  }
});

// 3. Desconectar WhatsApp
atendimentoRouter.post('/session/disconnect', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const sessionInfo = await whatsappManager.disconnectSession(companyId);
    res.json(sessionInfo);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao desconectar WhatsApp' });
  }
});

// 4. Stream SSE em Tempo Real (Server-Sent Events)
atendimentoRouter.get('/events', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Envia estado inicial da sessão
    const initialSession = whatsappManager.getSessionInfo(companyId);
    res.write(`data: ${JSON.stringify({ type: 'session_status', companyId, data: initialSession })}\n\n`);

    // Registra listener no WhatsAppManager
    const unsubscribe = whatsappManager.subscribe(companyId, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    // Heartbeat a cada 20s para manter conexão viva
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 5. Listar Conversas com Filtros
atendimentoRouter.get('/conversations', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const { status, assignedUserId, tagId, search } = req.query;

    const list = atendimentoStore.getConversations(companyId, {
      status: status as any,
      assignedUserId: assignedUserId as string,
      tagId: tagId as string,
      search: search as string,
    });

    res.json(list);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 6. Iniciar Nova Conversa Manual
atendimentoRouter.post('/conversations', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const { customerPhone, customerName, initialMessage, authorName, authorId } = req.body;

    if (!customerPhone) {
      return res.status(400).json({ error: 'Número de telefone do cliente é obrigatório.' });
    }

    const conv = atendimentoStore.findOrCreateConversation(companyId, customerPhone, customerName || customerPhone);

    if (initialMessage && initialMessage.trim()) {
      await whatsappManager.sendMessage(companyId, customerPhone, initialMessage.trim(), authorName, authorId);
    }

    res.json(conv);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// 7. Obter Mensagens de uma Conversa
atendimentoRouter.get('/conversations/:id/messages', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;

    const messages = atendimentoStore.getMessages(companyId, conversationId);
    res.json(messages);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 8. Enviar Mensagem de Texto no WhatsApp
atendimentoRouter.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;
    const { text, authorName, authorId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'O texto da mensagem é obrigatório.' });
    }

    const conv = atendimentoStore.getConversation(companyId, conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    const sent = await whatsappManager.sendMessage(
      companyId,
      conv.customerPhone,
      text.trim(),
      conversationId,
      authorName,
      authorId
    );

    res.json(sent);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao enviar mensagem via WhatsApp' });
  }
});

// 9. Marcar Conversa como Lida
atendimentoRouter.post('/conversations/:id/read', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;

    atendimentoStore.markMessagesAsRead(companyId, conversationId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 10. Atribuir / Transferir Atendente
atendimentoRouter.post('/conversations/:id/assign', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;
    const { userId, userName } = req.body;

    const updated = atendimentoStore.updateConversation(companyId, conversationId, {
      assignedUserId: userId || undefined,
      assignedUserName: userName || undefined,
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 11. Atualizar Status da Conversa (OPEN, IN_PROGRESS, RESOLVED)
atendimentoRouter.post('/conversations/:id/status', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;
    const { status } = req.body;

    const updated = atendimentoStore.updateConversation(companyId, conversationId, {
      status,
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 12. Atualizar Etiquetas da Conversa
atendimentoRouter.post('/conversations/:id/tags', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;
    const { tags } = req.body;

    const updated = atendimentoStore.updateConversation(companyId, conversationId, {
      tags: Array.isArray(tags) ? tags : [],
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 13. Notas Internas (Confidenciais, nunca enviadas ao cliente)
atendimentoRouter.get('/conversations/:id/notes', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;

    const notes = atendimentoStore.getInternalNotes(companyId, conversationId);
    res.json(notes);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

atendimentoRouter.post('/conversations/:id/notes', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const conversationId = req.params.id;
    const { content, authorId, authorName } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo da nota é obrigatório.' });
    }

    const note = atendimentoStore.addInternalNote(companyId, {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      companyId,
      authorId: authorId || 'dono',
      authorName: authorName || 'Dono',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    res.json(note);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 14. Gerenciamento de Etiquetas
atendimentoRouter.get('/tags', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const tags = atendimentoStore.getTags(companyId);
    res.json(tags);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

atendimentoRouter.post('/tags', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const { id, name, color, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da etiqueta é obrigatório.' });
    }

    const tag = atendimentoStore.saveTag(companyId, {
      id: id || `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      name: name.trim(),
      color: color || '#ea580c',
      description: description?.trim(),
    });

    res.json(tag);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

atendimentoRouter.delete('/tags/:id', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const success = atendimentoStore.deleteTag(companyId, req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 15. Respostas Rápidas
atendimentoRouter.get('/quick-replies', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const qrs = atendimentoStore.getQuickReplies(companyId);
    res.json(qrs);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

atendimentoRouter.post('/quick-replies', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const { id, shortcut, title, category, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo da resposta rápida são obrigatórios.' });
    }

    const qr = atendimentoStore.saveQuickReply(companyId, {
      id: id || `qr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      shortcut: (shortcut || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase(),
      title: title.trim(),
      category: category?.trim() || 'Geral',
      content: content.trim(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
    });

    res.json(qr);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

atendimentoRouter.delete('/quick-replies/:id', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const success = atendimentoStore.deleteQuickReply(companyId, req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

atendimentoRouter.post('/quick-replies/:id/use', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    atendimentoStore.incrementQuickReplyUsage(companyId, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});

// 16. Métricas do Dashboard de Atendimento
atendimentoRouter.get('/metrics', (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req);
    const metrics = atendimentoStore.getMetrics(companyId);
    res.json(metrics);
  } catch (err: any) {
    res.status(400).json({ error: err?.message });
  }
});
