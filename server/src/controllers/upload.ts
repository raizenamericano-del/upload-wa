import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import { ApiResponse, UploadResult, UploadProgress, CompressionOptions } from '../types';
import { getActiveSocket, postStatus } from '../services/baileysService';
import { compressMedia, optimizeForWhatsAppStatus, cleanupTempFiles, getMediaType } from '../services/compressionService';
import { saveUploadedFile, saveUploadHistory } from '../services/storageService';
import { getConnectionState } from '../services/baileysService';
import { asyncHandler } from '../middleware/error';

// Temporary upload directory
const TEMP_UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || path.join(__dirname, '../../temp/uploads');
fs.ensureDirSync(TEMP_UPLOAD_DIR);

// Upload a file for status
export const uploadFile = asyncHandler(async (req: Request, res: Response<ApiResponse<UploadResult>>) => {
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;
  const compress = req.body.compress !== false; // Default: true
  const compressionOptions: CompressionOptions = req.body.compressionOptions || {};
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  if (!req.file && !req.files?.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }
  
  const file = req.file || req.files?.file;
  const filePath = file.path;
  const originalName = file.originalname;
  const mimetype = file.mimetype;
  const size = file.size;
  
  logger.info(`Upload received for ${sessionId}: ${originalName}, size: ${size}, compress: ${compress}`);
  
  try {
    // Check if session is connected
    const connectionState = getConnectionState(sessionId);
    
    if (connectionState.status !== 'connected') {
      // Clean up
      await fs.unlink(filePath);
      
      return res.status(403).json({
        success: false,
        error: 'Session not connected to WhatsApp',
      });
    }
    
    // Get the socket for progress updates
    // Note: In production, you'd need to track which socket belongs to which session
    // For now, we'll simulate progress
    
    // Determine media type
    const mediaType = getMediaType(filePath);
    const isVideo = mediaType === 'video';
    
    let processedFilePath = filePath;
    let compressedSize = size;
    let compressionApplied = false;
    
    // Compress if requested
    if (compress) {
      // Emit compression start
      // In a real implementation, this would go through the socket
      
      // Optimize for WhatsApp
      const tempOutputPath = path.join(TEMP_UPLOAD_DIR, `kyy_${Date.now()}_${path.basename(filePath)}`);
      
      const compressionResult = await optimizeForWhatsAppStatus(filePath, (progress: UploadProgress) => {
        // Broadcast progress to client
        // This would be handled by the socket connection
        logger.info(`Compression progress for ${sessionId}: ${progress.stage} ${progress.progress}%`);
      });
      
      if (compressionResult.success && compressionResult.outputPath) {
        processedFilePath = compressionResult.outputPath;
        compressedSize = compressionResult.compressedSize || size;
        compressionApplied = true;
        
        // Clean up original
        await fs.unlink(filePath);
        
        logger.info(`Compression successful for ${sessionId}: ${size} -> ${compressedSize} bytes`);
      } else {
        logger.warn(`Compression failed for ${sessionId}: ${compressionResult.error}`);
        // Continue with original file
      }
    }
    
    // Post to WhatsApp Status
    const postResult = await postStatus(sessionId, processedFilePath, isVideo);
    
    if (!postResult.success) {
      // Clean up
      await fs.unlink(processedFilePath);
      
      return res.status(500).json({
        success: false,
        error: postResult.error || 'Failed to post status',
      });
    }
    
    // Save to history
    await saveUploadHistory({
      id: `upload_${Date.now()}`,
      fileName: originalName,
      fileType: mediaType,
      originalSize: size,
      compressedSize: compressionApplied ? compressedSize : undefined,
      uploadDate: new Date(),
      statusId: postResult.statusId,
      success: true,
    });
    
    // Clean up temporary files
    await fs.unlink(processedFilePath);
    await cleanupTempFiles();
    
    logger.info(`Status posted successfully for ${sessionId}: ${originalName}`);
    
    res.json({
      success: true,
      data: {
        success: true,
        message: 'Status berhasil diupload!',
        filePath: processedFilePath,
        statusId: postResult.statusId,
      },
    });
  } catch (error) {
    logger.error(`Upload error for ${sessionId}:`, error);
    
    // Clean up
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      logger.error('Failed to cleanup upload file:', cleanupError);
    }
    
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to upload and post status',
    });
  }
});

// Upload with compression options
export const uploadWithCompression = asyncHandler(async (req: Request, res: Response<ApiResponse<UploadResult>>) => {
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;
  const { compress = true, compressionOptions = {} } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required',
    });
  }
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }
  
  const filePath = req.file.path;
  const mediaType = getMediaType(filePath);
  
  try {
    const connectionState = getConnectionState(sessionId);
    
    if (connectionState.status !== 'connected') {
      await fs.unlink(filePath);
      return res.status(403).json({
        success: false,
        error: 'Session not connected to WhatsApp',
      });
    }
    
    let processedFilePath = filePath;
    
    if (compress) {
      const tempOutputPath = path.join(TEMP_UPLOAD_DIR, `kyy_${Date.now()}_${path.basename(filePath)}`);
      
      const compressionResult = await compressMedia(
        filePath,
        tempOutputPath,
        compressionOptions
      );
      
      if (compressionResult.success && compressionResult.outputPath) {
        processedFilePath = compressionResult.outputPath;
        await fs.unlink(filePath);
      }
    }
    
    const postResult = await postStatus(sessionId, processedFilePath, mediaType === 'video');
    
    if (!postResult.success) {
      await fs.unlink(processedFilePath);
      return res.status(500).json({
        success: false,
        error: postResult.error || 'Failed to post status',
      });
    }
    
    await fs.unlink(processedFilePath);
    
    res.json({
      success: true,
      data: {
        success: true,
        message: 'Status posted successfully',
        statusId: postResult.statusId,
      },
    });
  } catch (error) {
    logger.error(`Upload with compression error for ${sessionId}:`, error);
    
    try {
      await fs.unlink(filePath);
    } catch (cleanupError) {
      logger.error('Failed to cleanup upload file:', cleanupError);
    }
    
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to upload and post status',
    });
  }
});

// Get upload history
export const getUploadHistory = asyncHandler(async (req: Request, res: Response<ApiResponse<{ history: any[] }>>) => {
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;
  const limit = parseInt(req.query.limit as string) || 50;
  
  try {
    // In a full implementation, we'd filter by session
    // For now, return all history
    
    res.json({
      success: true,
      data: { history: [] }, // Will be implemented
    });
  } catch (error) {
    logger.error('Get upload history error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get upload history',
    });
  }
});

// Get compression recommendations
export const getCompressionRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }
  
  try {
    const filePath = req.file.path;
    const recommendations = await import('../services/compressionService').then(m => m.getCompressionRecommendations(filePath));
    
    // Clean up
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Get compression recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get compression recommendations',
    });
  }
});
