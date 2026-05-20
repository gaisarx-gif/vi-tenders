/**
 * Request logging middleware.
 *
 * Logs every non-static request after `res.finish` with method, URL,
 * status code, duration, and IP. Static assets (JS/CSS/images/Vite HMR
 * paths) are skipped to keep the log signal clean.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.ts';

const STATIC_RE = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|map|tsx|ts)$/;

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const isStaticAsset =
    STATIC_RE.test(req.url) || req.url.startsWith('/@vite/') || req.url.startsWith('/src/');

  if (isStaticAsset) {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
}
