/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mise — Servidor Full-Stack Express + Vite SPA
 * Roda na porta 3000 suportando rotas de API em /api/atendimento/* e o frontend Vite.
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { atendimentoRouter } from './src/server/atendimento-router';
import { integrationsRouter, oauthCallbackHandler } from './src/server/integrations-router';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares de JSON e URL encoded
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Rotas de Integrações de Delivery (iFood e 99Food)
  app.use('/api/integrations', integrationsRouter);

  // Rotas de OAuth 2.0 diretas (para compatibilidade com provedores e popups)
  app.get(['/auth/callback', '/auth/callback/'], oauthCallbackHandler);
  app.get(['/api/auth/callback', '/api/auth/callback/'], oauthCallbackHandler);
  app.get('/api/auth/url', (req, res) => {
    const params = new URLSearchParams(req.query as Record<string, string>);
    res.redirect(`/api/integrations/oauth/url?${params.toString()}`);
  });

  // Rotas legadas da API de Atendimento
  app.use('/api/atendimento', atendimentoRouter);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'mise-platform', timestamp: new Date().toISOString() });
  });

  // Montagem do Vite: dev server com middlewareMode
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo de produção: arquivos estáticos em dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mise] Servidor operacional executando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Mise] Falha crítica ao iniciar servidor:', err);
  process.exit(1);
});
