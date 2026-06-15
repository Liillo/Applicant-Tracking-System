import express    from 'express';
import cors       from 'cors';
import dotenv     from 'dotenv';
import path       from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './src/middleware/auth.js';

import authRouter         from './src/routes/auth.js';
import jobsRouter         from './src/routes/jobs.js';
import applicationsRouter from './src/routes/applications.js';
import departmentsRouter  from './src/routes/departments.js';
import { prisma } from './src/db.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, '../web/dist');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests and local development origins.
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
// Routes
app.use('/api/auth',         authRouter);
app.use('/api/jobs',         jobsRouter);
app.use('/api/applications', requireAuth, applicationsRouter);
app.use('/api/departments',  departmentsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Serve the built frontend from the same server in production.
app.use(express.static(webDistPath));
app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export { app };

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  app.listen(PORT, () => console.log(`HRMPEB API running on http://localhost:${PORT}`));
}
