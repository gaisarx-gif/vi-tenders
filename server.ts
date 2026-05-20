/**
 * Server entry point.
 *
 * This file does as little as possible. All real logic lives in:
 *   - server/lib/*         shared utilities (env, logger, uid, firebase-admin)
 *   - server/middleware/*  cross-cutting middleware (security, rate-limit, log, auth)
 *   - server/schemas/*     Zod schemas (one per resource)
 *   - server/routes/*      Express routers (one per resource)
 *
 * Order of middleware application matters. Health is registered BEFORE the
 * rate limiter so health checks stay available under load.
 */

import express from 'express';
import type { Express } from 'express';
import cookieParser from 'cookie-parser';

import { logger } from './server/lib/logger.js';
// Side-effect import: initializes the Firebase Admin SDK so any downstream
// route module that imports `db` from `server/lib/firebase-admin` sees it.
import './server/lib/firebase-admin.js';

import { applySecurityMiddleware } from './server/middleware/security.js';
import { apiLimiter } from './server/middleware/rate-limit.js';
import { requestLogger } from './server/middleware/request-log.js';

import { healthRouter } from './server/routes/health.js';
import { authRouter } from './server/routes/auth.js';
import { meRouter } from './server/routes/me.js';
import { employeesRouter } from './server/routes/employees.js';
import { subscriptionsRouter } from './server/routes/subscriptions.js';
import { notificationsRouter } from './server/routes/notifications.js';
import { calendarRouter } from './server/routes/calendar.js';
import { companiesRouter } from './server/routes/companies.js';
import { tendersRouter } from './server/routes/tenders.js';
import { adminTendersRouter } from './server/routes/admin-tenders.js';
import { issuesRouter } from './server/routes/issues.js';
import { organizationsRouter } from './server/routes/organizations.js';
import { ingestRouter } from './server/routes/ingest.js';

import { startServer } from './server/serve-app.js';

logger.info('Starting server initialization...');

export function createApp(): Express {
  const app: Express = express();

  // 1. Security: helmet + CORS + trust proxy + Firebase Auth same-origin proxy.
  applySecurityMiddleware(app);

  // 2. Health BEFORE rate limit so it stays reachable when other routes are throttled.
  app.use('/api', healthRouter);

  // 3. Rate limit + request logging + body parsing.
  app.use('/api/', apiLimiter);
  app.use(requestLogger);
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // 4. API routes.
  app.use('/api', authRouter);
  app.use('/api', meRouter);
  app.use('/api', employeesRouter);
  app.use('/api', subscriptionsRouter);
  app.use('/api', notificationsRouter);
  app.use('/api', calendarRouter);
  app.use('/api', companiesRouter);
  app.use('/api', tendersRouter);
  app.use('/api', adminTendersRouter);
  app.use('/api', issuesRouter);
  app.use('/api', organizationsRouter);
  app.use('/api', ingestRouter);

  return app;
}

if (!process.env.VERCEL) {
  startServer(createApp());
}
