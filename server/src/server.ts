import app from './app';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';
import logger from './utils/logger';
import { initializeStorage } from './services/storageService';
import { cleanupAllSessions } from './services/baileysService';
import { SESSION_DIR } from './config/baileys';

// Port configuration
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

// Initialize services
async function initializeServices() {
  logger.info('Initializing services...');
  
  // Initialize storage
  await initializeStorage();
  
  // Ensure session directory exists
  const fs = await import('fs-extra');
  await fs.ensureDir(SESSION_DIR);
  
  logger.info('Services initialized');
}

// Start server
async function startServer() {
  try {
    // Initialize services
    await initializeServices();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    const io = initializeSocket(httpServer);
    
    // Store io in app for routes to access
    (app as any).io = io;
    
    // Start listening
    httpServer.listen(PORT, HOST, () => {
      logger.info(`Server is running on http://${HOST}:${PORT}`);
      logger.info(`Socket.io is ready`);
      logger.info(`Session directory: ${SESSION_DIR}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Handle server errors
    httpServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      
      try {
        // Close server
        httpServer.close(() => {
          logger.info('Server closed');
        });
        
        // Clean up sessions
        await cleanupAllSessions();
        
        // Exit
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
    });
    
    return httpServer;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
