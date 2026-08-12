import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { getConnectionState } from '../services/baileysService';

export interface AuthRequest extends Request {
  sessionId?: string;
  phoneNumber?: string;
}

// Middleware to check if session is connected
export function requireConnectedSession(req: AuthRequest, res: Response, next: NextFunction) {
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;
  
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  req.sessionId = sessionId;
  
  try {
    const connectionState = getConnectionState(sessionId);
    
    if (connectionState.status !== 'connected') {
      return res.status(403).json({
        success: false,
        error: 'Session not connected to WhatsApp',
        connectionStatus: connectionState.status,
      });
    }
    
    req.phoneNumber = connectionState.phoneNumber;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify session',
    });
  }
}

// Middleware to extract session ID
export function extractSessionId(req: AuthRequest, res: Response, next: NextFunction) {
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;
  
  if (sessionId) {
    req.sessionId = sessionId;
  }
  
  next();
}

// Middleware for error handling
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
}

// Middleware to check API key (optional, for future)
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;
  const expectedKey = process.env.API_KEY;
  
  if (expectedKey && apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
    });
  }
  
  next();
}
