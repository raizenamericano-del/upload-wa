import { Request, Response } from 'express';
import logger from '../utils/logger';
import {
  initializeConnection,
  disconnectSession,
  getConnectionState,
  generateSessionId,
  getSessionInfo,
  getAllConnections,
  reconnectSession,
} from '../services/baileysService';
import { ConnectionState, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/error';

// Generate a new session ID
export const generateSession = asyncHandler(async (req: Request, res: Response<ApiResponse<{ sessionId: string }>>) => {
  const sessionId = generateSessionId();
  
  logger.info(`Generated new session: ${sessionId}`);
  
  res.json({
    success: true,
    data: { sessionId },
    message: 'New session ID generated',
  });
});

// Initialize a connection
export const initConnection = asyncHandler(async (req: Request, res: Response<ApiResponse<ConnectionState>>) => {
  const { sessionId, phoneNumber } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  logger.info(`Initializing connection for ${sessionId}, phone: ${phoneNumber || 'new'}`);
  
  try {
    const state = await initializeConnection(sessionId, phoneNumber);
    
    res.json({
      success: true,
      data: state,
      message: 'Connection initialization started',
    });
  } catch (error) {
    logger.error(`Connection init error for ${sessionId}:`, error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to initialize connection',
    });
  }
});

// Get connection state
export const getConnectionStateController = asyncHandler(async (req: Request, res: Response<ApiResponse<ConnectionState>>) => {
  const sessionId = req.params.sessionId || req.query.sessionId as string;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  const state = getConnectionState(sessionId);
  
  res.json({
    success: true,
    data: state,
  });
});

// Get QR code for a session
export const getQRCode = asyncHandler(async (req: Request, res: Response<ApiResponse<{ qrCode: string }>>) => {
  const sessionId = req.params.sessionId;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  const state = getConnectionState(sessionId);
  
  if (!state.qrCode) {
    return res.status(404).json({
      success: false,
      error: 'No QR code available. Please initialize connection first.',
    });
  }
  
  res.json({
    success: true,
    data: { qrCode: state.qrCode },
  });
});

// Get pairing code for a session
export const getPairingCode = asyncHandler(async (req: Request, res: Response<ApiResponse<{ pairingCode: string }>>) => {
  const sessionId = req.params.sessionId;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  const state = getConnectionState(sessionId);
  
  if (!state.pairingCode) {
    return res.status(404).json({
      success: false,
      error: 'No pairing code available. Please initialize connection first.',
    });
  }
  
  res.json({
    success: true,
    data: { pairingCode: state.pairingCode },
  });
});

// Disconnect a session
export const disconnect = asyncHandler(async (req: Request, res: Response<ApiResponse<{ success: boolean }>>) => {
  const sessionId = req.params.sessionId;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  try {
    const success = await disconnectSession(sessionId);
    
    res.json({
      success: true,
      data: { success },
      message: success ? 'Session disconnected' : 'Failed to disconnect session',
    });
  } catch (error) {
    logger.error(`Disconnect error for ${sessionId}:`, error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to disconnect session',
    });
  }
});

// Reconnect a session
export const reconnect = asyncHandler(async (req: Request, res: Response<ApiResponse<{ success: boolean }>>) => {
  const sessionId = req.params.sessionId;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  try {
    const success = await reconnectSession(sessionId);
    
    res.json({
      success: true,
      data: { success },
      message: success ? 'Reconnection started' : 'Failed to reconnect',
    });
  } catch (error) {
    logger.error(`Reconnect error for ${sessionId}:`, error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to reconnect session',
    });
  }
});

// Get session info
export const getSession = asyncHandler(async (req: Request, res: Response<ApiResponse<any>>) => {
  const sessionId = req.params.sessionId;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  try {
    const info = await getSessionInfo(sessionId);
    
    if (!info.exists) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    logger.error(`Get session error for ${sessionId}:`, error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get session info',
    });
  }
});

// List all active connections
export const listConnections = asyncHandler(async (req: Request, res: Response<ApiResponse<{ connections: any[] }>>) => {
  try {
    const connections = getAllConnections();
    
    res.json({
      success: true,
      data: { connections },
    });
  } catch (error) {
    logger.error('List connections error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to list connections',
    });
  }
});

// Check if session is connected
export const checkConnected = asyncHandler(async (req: Request, res: Response<ApiResponse<{ connected: boolean }>>) => {
  const sessionId = req.params.sessionId || req.query.sessionId as string;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  const state = getConnectionState(sessionId);
  
  res.json({
    success: true,
    data: { connected: state.status === 'connected' },
  });
});
