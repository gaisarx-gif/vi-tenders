import './server/lib/firebase-admin.ts';

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../server/lib/logger.js';
import { IS_PROD, FIREBASE_AUTH_DOMAIN, corsOrigins } from '../server/lib/env.js';
import { apiLimiter } from '../server/middleware/rate-limit.ts';
import { requestLogger } from '../server/middleware/request-log.ts';
import { healthRouter } from '../server/routes/health.ts';
import { authRouter } from '../server/routes/auth.ts';
import { meRouter } from '../server/routes/me.ts';
import { employeesRouter } from '../server/routes/employees.ts';
import { subscriptionsRouter } from '../server/routes/subscriptions.ts';
import { notificationsRouter } from '../server/routes/notifications.ts';
import { calendarRouter } from '../server/routes/calendar.ts';
import { companiesRouter } from '../server/routes/companies.ts';
import { tendersRouter } from '../server/routes/tenders.ts';
import { adminTendersRouter } from '../server/routes/admin-tenders.ts';
import { issuesRouter } from '../server/routes/issues.ts';
import { organizationsRouter } from '../server/routes/organizations.ts';
import { ingestRouter } from '../server/routes/ingest.ts';

logger.info('Building Express app on Vercel...');

const app = express();

try {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com', 'https://www.gstatic.com', 'https://*.firebaseapp.com', 'https://*.googleapis.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'https://*.firebaseapp.com', 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://*.google.com', 'wss://*.firebaseio.com'],
        frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com', 'https://localhost:*', 'http://localhost:*'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' },
  }));

  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.set('trust proxy', 1);

  if (FIREBASE_AUTH_DOMAIN) {
    app.use(createProxyMiddleware({
      pathFilter: '/__/auth',
      target: `https://${FIREBASE_AUTH_DOMAIN}`,
      changeOrigin: true,
      secure: true,
      cookieDomainRewrite: { [FIREBASE_AUTH_DOMAIN]: '' },
    }));
  }

  app.use('/api', healthRouter);
  app.use('/api/', apiLimiter);
  app.use(requestLogger);
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());
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

  logger.info('Express app fully configured');
} catch (err) {
  logger.error('Failed to build Express app', { error: String(err) });
}

export default app;
