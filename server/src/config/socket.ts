import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../utils/logger';
import { AppSocket, ConnectionState } from '../types';
import {
  initializeConnection,
  disconnectSession,
  getConnectionState,
  generateSessionId,
  getSessionInfo,
} from '../services/baileysService';
import { postStatus } from '../services/baileysService';
import { compressMedia, optimizeForWhatsAppStatus, cleanupTempFiles } from '../services/compressionService';
import { saveUploadedFile, saveUploadHistory } from '../services/storageService';
import path from 'path';

// Socket.io configuration
export interface SocketConfig {
  corsOrigin: string;
  maxHttpBufferSize: number;
  pingTimeout: number;
  pingInterval: number;
}

const socketConfig: SocketConfig = {
  corsOrigin: process.env.CORS_ORIGIN || '*',
  maxHttpBufferSize: 1e8, // 100 MB
  pingTimeout: 20000,
  pingInterval: 25000,
};

// Active socket connections
const activeSockets: Map<string, AppSocket> = new Map();

// Initialize Socket.io
export function initializeSocket(httpServer: HttpServer) {
  const io = new Server<never, never, never, never>(httpServer, {
    cors: {
      origin: socketConfig.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: socketConfig.maxHttpBufferSize,
    pingTimeout: socketConfig.pingTimeout,
    pingInterval: socketConfig.pingInterval,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  logger.info('Socket.io initialized');

  // Connection handler
  io.on('connection', (socket: AppSocket) => {
    const socketId = socket.id;
    const sessionId = socket.handshake.query.sessionId as string || generateSessionId();
    
    logger.info(`Socket connected: ${socketId}, Session: ${sessionId}`);
    activeSockets.set(socketId, socket);
    
    // Store session ID in socket data
    socket.data.sessionId = sessionId;
    
    // Send initial connection state
    const connectionState = getConnectionState(sessionId);
    socket.emit('connection:status', connectionState);
    
    // Handle connection initialization
    socket.on('connection:init', async (phoneNumber?: string) => {
      logger.info(`Initializing connection for socket ${socketId}, phone: ${phoneNumber || 'new'}`);
      
      try {
        // Clean up any existing session files
        await cleanupTempFiles();
        
        // Initialize connection
        const state = await initializeConnection(sessionId, phoneNumber);
        
        // Emit initial state
        socket.emit('connection:status', state);
        
        // If QR code is needed, emit it
        if (state.status === 'waiting' && state.qrCode) {
          socket.emit('connection:qr', state.qrCode);
        }
        
        // If pairing code is available
        if (state.pairingCode) {
          socket.emit('connection:pairing', state.pairingCode);
        }
      } catch (error) {
        logger.error(`Failed to initialize connection for ${socketId}:`, error);
        socket.emit('connection:error', error?.message || 'Failed to initialize connection');
      }
    });
    
    // Handle reconnection
    socket.on('connection:reconnect', async () => {
      logger.info(`Reconnecting for socket ${socketId}`);
      
      try {
        const connectionState = getConnectionState(sessionId);
        socket.emit('connection:status', connectionState);
        
        if (connectionState.status === 'waiting' && connectionState.qrCode) {
          socket.emit('connection:qr', connectionState.qrCode);
        }
      } catch (error) {
        logger.error(`Reconnection error for ${socketId}:`, error);
        socket.emit('error', error?.message || 'Reconnection failed');
      }
    });
    
    // Handle disconnection
    socket.on('connection:disconnect', async () => {
      logger.info(`Disconnecting session ${sessionId} from socket ${socketId}`);
      
      try {
        await disconnectSession(sessionId);
        socket.emit('connection:status', { status: 'disconnected' } as ConnectionState);
      } catch (error) {
        logger.error(`Failed to disconnect session ${sessionId}:`, error);
        socket.emit('error', error?.message || 'Failed to disconnect');
      }
    });
    
    // Handle upload start
    socket.on('upload:start', async (data: { compress: boolean; compressionOptions?: any }) => {
      logger.info(`Upload started for socket ${socketId}, compress: ${data.compress}`);
      
      try {
        const connectionState = getConnectionState(sessionId);
        
        if (connectionState.status !== 'connected') {
          throw new Error('Not connected to WhatsApp');
        }
        
        // For now, we'll handle the actual upload in the HTTP endpoint
        // This is just for signaling
        socket.emit('upload:progress', {
          stage: 'uploading',
          progress: 0,
          message: 'Waiting for file upload...',
        });
      } catch (error) {
        logger.error(`Upload start error for ${socketId}:`, error);
        socket.emit('upload:result', {
          success: false,
          message: 'Upload failed',
          error: error?.message || 'Unknown error',
        });
      }
    });
    
    // Handle status fetch
    socket.on('status:fetch', async () => {
      logger.info(`Fetching status for socket ${socketId}`);
      
      try {
        const connectionState = getConnectionState(sessionId);
        
        if (connectionState.status !== 'connected') {
          throw new Error('Not connected to WhatsApp');
        }
        
        // For now, return empty array
        // In a full implementation, we would fetch the actual status
        socket.emit('status:list', []);
      } catch (error) {
        logger.error(`Status fetch error for ${socketId}:`, error);
        socket.emit('error', error?.message || 'Failed to fetch status');
      }
    });
    
    // Handle socket disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socketId}`);
      activeSockets.delete(socketId);
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
      logger.error(`Socket connection error for ${socketId}:`, error);
    });
  });

  return io;
}

// Get active sockets count
export function getActiveSocketsCount(): number {
  return activeSockets.size;
}

// Broadcast to all sockets
export function broadcastToAll(event: string, data: any) {
  // This would be called from the io instance
  // For now, just log
  logger.info(`Broadcasting ${event} to all sockets`);
}
