import { makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, WADefaultSchemas } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs-extra';
import logger from '../utils/logger';

// Session storage directory
const SESSION_DIR = process.env.SESSION_DIR || path.join(__dirname, '../../sessions');

// Ensure session directory exists
fs.ensureDirSync(SESSION_DIR);

// Generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get auth state for a session
export async function getAuthState(sessionId: string) {
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);
  
  return useSingleFileAuthState(sessionPath);
}

// Create a new WhatsApp socket
export async function createWASocket(sessionId: string) {
  const { state, saveState } = await getAuthState(sessionId);
  
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Using BAILEYS version: ${version.join('.')}, isLatest: ${isLatest}`);

  const socket = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    browser: ['KyyStatus HD', 'Chrome', '1.0.0'],
    // Enable for better performance
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => false,
    // Enable for multi-device
    multiDevice: true,
  });

  // Save session state periodically
  socket.ev.on('creds.update', saveState);
  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      logger.info(`QR Code generated for session ${sessionId}`);
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      if (shouldReconnect) {
        logger.info(`Reconnecting session ${sessionId}...`);
        // Auto-reconnect logic will be handled by the connection manager
      } else {
        logger.info(`Logged out from session ${sessionId}`);
      }
    }
  });

  // Handle connection errors
  socket.ev.on('connection.error', (error) => {
    logger.error(`Connection error for session ${sessionId}:`, error);
  });

  // Handle chats and messages (optional, for future features)
  socket.ev.on('chats.upsert', () => {});
  socket.ev.on('messages.upsert', () => {});

  return socket;
}

// Clean up session
export async function cleanupSession(sessionId: string) {
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);
  
  try {
    await fs.unlink(sessionPath);
    logger.info(`Session ${sessionId} cleaned up`);
  } catch (error) {
    logger.error(`Failed to cleanup session ${sessionId}:`, error);
  }
}

// List all active sessions
export async function listSessions(): Promise<string[]> {
  try {
    const files = await fs.readdir(SESSION_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch (error) {
    logger.error('Failed to list sessions:', error);
    return [];
  }
}

// Get session info
export async function getSessionInfo(sessionId: string): Promise<{ exists: boolean; phoneNumber?: string }> {
  const sessionPath = path.join(SESSION_DIR, `${sessionId}.json`);
  
  try {
    const exists = await fs.pathExists(sessionPath);
    if (!exists) {
      return { exists: false };
    }
    
    // Read session file to extract phone number
    const sessionData = await fs.readJson(sessionPath);
    const phoneNumber = sessionData?.creds?.me?.id?.split(':')[0];
    
    return { exists: true, phoneNumber };
  } catch (error) {
    logger.error(`Failed to get session info for ${sessionId}:`, error);
    return { exists: false };
  }
}

export { SESSION_DIR };
