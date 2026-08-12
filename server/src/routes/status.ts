import { Router } from 'express';
import { getMyStatus, getStatusByJid, deleteMyStatus } from '../controllers/status';
import { requireConnectedSession, extractSessionId } from '../middleware/auth';

const router = Router();

// Apply session ID extraction
router.use(extractSessionId);

// Status endpoints
router.get('/my', requireConnectedSession, getMyStatus);
router.get('/:jid', requireConnectedSession, getStatusByJid);
router.delete('/:statusId', requireConnectedSession, deleteMyStatus);

export default router;
