import { Router } from 'express';
import { getActiveSocketsCount } from '../config/socket';
import { listSessions } from '../config/baileys';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const activeSockets = getActiveSocketsCount();
    const sessions = await listSessions();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      connections: {
        activeSockets,
        activeSessions: sessions.length,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown error',
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

export default router;
