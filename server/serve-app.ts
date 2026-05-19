import type { Express } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';

import { logger } from '../server/lib/logger.js';
import { PORT } from '../server/lib/env.js';

export async function startServer(app: Express): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}
