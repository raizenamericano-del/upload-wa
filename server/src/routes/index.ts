import { Router } from 'express';
import connectionRoutes from './connection';
import uploadRoutes from './upload';
import statusRoutes from './status';
import healthRoutes from './health';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Connection routes
router.use('/api/connections', connectionRoutes);

// Upload routes
router.use('/api/uploads', uploadRoutes);

// Status routes
router.use('/api/status', statusRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'KyyStatus HD API',
    version: '1.0.0',
    description: 'WhatsApp Status Uploader with HD Compression',
    endpoints: {
      health: '/health',
      connections: '/api/connections',
      uploads: '/api/uploads',
      status: '/api/status',
    },
  });
});

export default router;
