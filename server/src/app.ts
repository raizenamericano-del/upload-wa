import express from 'express';
import cors from 'cors';
import path from 'path';
import logger from './utils/logger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { requireApiKey } from './middleware/auth';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Optional API key middleware (can be enabled via env)
if (process.env.REQUIRE_API_KEY === 'true') {
  app.use(requireApiKey);
  logger.info('API key authentication enabled');
}

// Static files
app.use('/static', express.static(path.join(__dirname, '../static')));

// Routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Health check at root
app.get('/', (req, res) => {
  res.json({
    name: 'KyyStatus HD',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

export default app;
