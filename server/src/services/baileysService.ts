import { makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, WADefaultSchemas, AnyMessageContent, AnyWAMessage, WAMessage, WA_SIGNATURE_PAD } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs-extra';
import logger from '../utils/logger';
import { ConnectionState, WAConnection } from '../types';
import { SESSION_DIR, getAuthState, cleanupSession } from '../config/baileys';

// Store active connections
const activeConnections: Map<string, { socket: any; sessionId: string; phoneNumber: string }> = new Map();

// Store session states
const sessionStates: Map<string, ConnectionState> = new Map();

// Generate unique session ID
export function generateSessionId(): string {
  return `kyy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize a new connection
export async function initializeConnection(sessionId: string, phoneNumber?: string): Promise<ConnectionState> {
  logger.info(`Initializing connection for session ${sessionId}`);

  const { state, saveState } = await getAuthState(sessionId);
  
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Using BAILEYS version: ${version.join('.')}`);

  const socket = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    browser: ['KyyStatus HD', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => false,
    multiDevice: true,
  });

  // Store the socket
  activeConnections.set(sessionId, { socket, sessionId, phoneNumber: phoneNumber || '' });

  // Initial state
  const initialState: ConnectionState = {
    status: 'connecting',
    phoneNumber,
    profileName: undefined,
    profilePicture: undefined,
  };
  
  sessionStates.set(sessionId, initialState);

  // Handle connection updates
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin } = update;
    const currentState = sessionStates.get(sessionId) || initialState;

    try {
      if (qr) {
        // Generate QR code string
        const qrCode = qr;
        sessionStates.set(sessionId, {
          ...currentState,
          status: 'waiting',
          qrCode,
          pairingCode: generatePairingCode(sessionId),
        });
        logger.info(`QR Code generated for session ${sessionId}`);
      }

      if (isNewLogin) {
        logger.info(`New login detected for session ${sessionId}`);
      }

      if (connection === 'connecting') {
        sessionStates.set(sessionId, {
          ...currentState,
          status: 'connecting',
          error: undefined,
        });
      }

      if (connection === 'open') {
        // Get user info
        const userInfo = await socket.user;
        const profileName = userInfo?.name || userInfo?.verifiedName || 'Unknown';
        const profilePicture = userInfo?.profilePictureUrl || userInfo?.profilePicture;
        const phoneNumber = userInfo?.id?.split(':')[0] || currentState.phoneNumber;

        sessionStates.set(sessionId, {
          ...currentState,
          status: 'connected',
          phoneNumber,
          profileName,
          profilePicture,
          qrCode: undefined,
          pairingCode: undefined,
          error: undefined,
        });
        
        // Update active connection
        activeConnections.set(sessionId, { socket, sessionId, phoneNumber });
        
        logger.info(`Connected successfully for session ${sessionId}, phone: ${phoneNumber}`);
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect) {
          sessionStates.set(sessionId, {
            ...currentState,
            status: 'connecting',
          });
          logger.info(`Connection closed, will reconnect for session ${sessionId}`);
          
          // Attempt to reconnect
          await reconnectSession(sessionId);
        } else {
          sessionStates.set(sessionId, {
            ...currentState,
            status: 'disconnected',
            error: 'Logged out or session expired',
          });
          logger.info(`Disconnected permanently for session ${sessionId}`);
        }
      }
    } catch (error) {
      logger.error(`Error in connection.update for ${sessionId}:`, error);
      sessionStates.set(sessionId, {
        ...currentState,
        status: 'error',
        error: 'Connection error occurred',
      });
    }
  });

  // Handle connection errors
  socket.ev.on('connection.error', (error) => {
    const currentState = sessionStates.get(sessionId) || initialState;
    logger.error(`Connection error for ${sessionId}:`, error);
    
    sessionStates.set(sessionId, {
      ...currentState,
      status: 'error',
      error: error?.message || 'Unknown connection error',
    });
  });

  // Save auth state
  socket.ev.on('creds.update', saveState);

  return initialState;
}

// Generate pairing code (8 digits)
function generatePairingCode(sessionId: string): string {
  // Use session ID to generate a deterministic but random-looking code
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = Math.abs(hash).toString().slice(0, 8);
  return code.padStart(8, '0');
}

// Reconnect a session
export async function reconnectSession(sessionId: string): Promise<boolean> {
  logger.info(`Reconnecting session ${sessionId}...`);
  
  try {
    const existing = activeConnections.get(sessionId);
    if (existing) {
      // Close existing socket
      existing.socket.ev.removeAllListeners();
      activeConnections.delete(sessionId);
    }
    
    // Re-initialize connection
    const connection = await getSessionInfo(sessionId);
    await initializeConnection(sessionId, connection.phoneNumber);
    
    return true;
  } catch (error) {
    logger.error(`Failed to reconnect session ${sessionId}:`, error);
    return false;
  }
}

// Get connection state
export function getConnectionState(sessionId: string): ConnectionState {
  return sessionStates.get(sessionId) || {
    status: 'disconnected',
    error: 'Session not found',
  };
}

// Disconnect a session
export async function disconnectSession(sessionId: string): Promise<boolean> {
  logger.info(`Disconnecting session ${sessionId}...`);
  
  try {
    const connection = activeConnections.get(sessionId);
    if (connection) {
      // Close socket
      connection.socket.ev.removeAllListeners();
      await connection.socket.end();
      activeConnections.delete(sessionId);
    }
    
    // Update state
    sessionStates.set(sessionId, {
      status: 'disconnected',
      phoneNumber: undefined,
      profileName: undefined,
      profilePicture: undefined,
      error: undefined,
    });
    
    return true;
  } catch (error) {
    logger.error(`Failed to disconnect session ${sessionId}:`, error);
    return false;
  }
}

// Get session info
export async function getSessionInfo(sessionId: string): Promise<{ exists: boolean; phoneNumber?: string; profileName?: string }> {
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);
  
  try {
    const exists = await fs.pathExists(sessionPath);
    if (!exists) {
      return { exists: false };
    }
    
    const sessionData = await fs.readJson(sessionPath);
    const phoneNumber = sessionData?.creds?.me?.id?.split(':')[0];
    const profileName = sessionData?.creds?.me?.name;
    
    return { exists: true, phoneNumber, profileName };
  } catch (error) {
    logger.error(`Failed to get session info for ${sessionId}:`, error);
    return { exists: false };
  }
}

// Get active socket for a session
export function getActiveSocket(sessionId: string) {
  const connection = activeConnections.get(sessionId);
  return connection?.socket;
}

// Get all active connections
export function getAllConnections(): WAConnection[] {
  return Array.from(activeConnections.values()).map(conn => ({
    id: conn.sessionId,
    phoneNumber: conn.phoneNumber,
    profileName: '',
    profilePicture: undefined,
    status: sessionStates.get(conn.sessionId)?.status || 'disconnected',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

// Post status to WhatsApp
export async function postStatus(sessionId: string, mediaPath: string, isVideo: boolean = false): Promise<{ success: boolean; statusId?: string; error?: string }> {
  const socket = getActiveSocket(sessionId);
  
  if (!socket) {
    return { success: false, error: 'No active connection found' };
  }

  try {
    const state = getConnectionState(sessionId);
    if (state.status !== 'connected') {
      return { success: false, error: 'Not connected to WhatsApp' };
    }

    // Read media file
    const mediaBuffer = await fs.readFile(mediaPath);
    const mediaData = mediaBuffer.toString('base64');
    
    // Prepare message content
    const message: AnyMessageContent = {
      [isVideo ? 'video' : 'image']: {
        url: mediaPath,
        mimetype: isVideo ? 'video/mp4' : 'image/jpeg',
      },
      statusJidList: [state.phoneNumber + '@s.whatsapp.net'],
    };

    // Send status update
    await socket.sendMessage(state.phoneNumber + '@s.whatsapp.net', message);
    
    logger.info(`Status posted successfully for session ${sessionId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to post status for ${sessionId}:`, error);
    return { success: false, error: error?.message || 'Failed to post status' };
  }
}

// Cleanup all sessions (for shutdown)
export async function cleanupAllSessions() {
  logger.info('Cleaning up all sessions...');
  
  for (const [sessionId] of activeConnections) {
    await disconnectSession(sessionId);
    await cleanupSession(sessionId);
  }
  
  activeConnections.clear();
  sessionStates.clear();
}
