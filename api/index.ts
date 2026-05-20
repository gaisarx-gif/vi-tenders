import express from 'express';
import cookieParser from 'cookie-parser';
import { logger } from '../server/lib/logger.js';
import { applySecurityMiddleware } from '../server/middleware/security.ts';
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

logger.info('Building full Express app for Vercel...');

const app = express();

try {
  applySecurityMiddleware(app);
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
