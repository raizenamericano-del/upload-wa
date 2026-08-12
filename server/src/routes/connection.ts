import { Router } from 'express';
import multer from 'multer';
import {
  generateSession,
  initConnection,
  getConnectionStateController,
  getQRCode,
  getPairingCode,
  disconnect,
  reconnect,
  getSession,
  listConnections,
  checkConnected,
} from '../controllers/connection';
import { requireConnectedSession, extractSessionId } from '../middleware/auth';

const router = Router();

// No authentication needed for these endpoints
router.post('/generate', generateSession);
router.post('/init', initConnection);
router.get('/:sessionId/state', getConnectionStateController);
router.get('/:sessionId/qr', getQRCode);
router.get('/:sessionId/pairing', getPairingCode);
router.get('/:sessionId', getSession);
router.post('/:sessionId/disconnect', disconnect);
router.post('/:sessionId/reconnect', reconnect);
router.get('/', listConnections);
router.get('/:sessionId/connected', checkConnected);

// With session ID extraction
router.use(extractSessionId);

// Connected session required for these
router.get('/:sessionId/profile', requireConnectedSession, (req, res) => {
  const state = req.app.get('connectionState');
  res.json({
    success: true,
    data: {
      phoneNumber: state?.phoneNumber,
      profileName: state?.profileName,
      profilePicture: state?.profilePicture,
    },
  });
});

export default router;
