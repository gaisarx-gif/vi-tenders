import './server/lib/firebase-admin.js';

import { healthRouter } from '../server/routes/health.js';
import { authRouter } from '../server/routes/auth.js';
import { meRouter } from '../server/routes/me.js';
import { employeesRouter } from '../server/routes/employees.js';
import { subscriptionsRouter } from '../server/routes/subscriptions.js';
import { notificationsRouter } from '../server/routes/notifications.js';
import { calendarRouter } from '../server/routes/calendar.js';
import { companiesRouter } from '../server/routes/companies.js';
import { tendersRouter } from '../server/routes/tenders.js';
import { adminTendersRouter } from '../server/routes/admin-tenders.js';
import { issuesRouter } from '../server/routes/issues.js';
import { organizationsRouter } from '../server/routes/organizations.js';
import { ingestRouter } from '../server/routes/ingest.js';

console.log('All routes imported successfully');
