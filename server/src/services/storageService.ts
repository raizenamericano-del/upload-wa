import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import { UploadHistory, UploadResult } from '../types';

// Storage directories
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../../storage');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const HISTORY_FILE = path.join(STORAGE_DIR, 'history.json');

// Ensure directories exist
fs.ensureDirSync(STORAGE_DIR);
fs.ensureDirSync(UPLOADS_DIR);

// Initialize history file
export async function initializeStorage() {
  try {
    const exists = await fs.pathExists(HISTORY_FILE);
    if (!exists) {
      await fs.writeJson(HISTORY_FILE, { uploads: [] });
      logger.info('Storage initialized');
    }
  } catch (error) {
    logger.error('Failed to initialize storage:', error);
  }
}

// Save uploaded file
export async function saveUploadedFile(file: { name: string; data: Buffer; mimetype: string }): Promise<string> {
  const ext = getExtensionFromMimetype(file.mimetype);
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  try {
    await fs.writeFile(filePath, file.data);
    logger.info(`File saved: ${fileName}`);
    return filePath;
  } catch (error) {
    logger.error('Failed to save file:', error);
    throw new Error('Failed to save uploaded file');
  }
}

// Get file extension from mimetype
function getExtensionFromMimetype(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/x-matroska': '.mkv',
    'video/3gpp': '.3gp',
  };
  return map[mimetype] || '.bin';
}

// Save upload history
export async function saveUploadHistory(history: UploadHistory): Promise<void> {
  try {
    const data = await fs.readJson(HISTORY_FILE);
    data.uploads = [history, ...(data.uploads || []).slice(0, 49)]; // Keep last 50
    await fs.writeJson(HISTORY_FILE, data, { spaces: 2 });
    logger.info('Upload history saved');
  } catch (error) {
    logger.error('Failed to save upload history:', error);
  }
}

// Get upload history
export async function getUploadHistory(limit: number = 50): Promise<UploadHistory[]> {
  try {
    const data = await fs.readJson(HISTORY_FILE);
    return (data.uploads || []).slice(0, limit);
  } catch (error) {
    logger.error('Failed to read upload history:', error);
    return [];
  }
}

// Delete a file from storage
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    logger.info(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    logger.error('Failed to delete file:', error);
    return false;
  }
}

// Clean up old files (older than X days)
export async function cleanupOldFiles(days: number = 7): Promise<number> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtimeMs < cutoff) {
        await fs.unlink(filePath);
        deletedCount++;
        logger.info(`Cleaned up old file: ${file}`);
      }
    }
    
    return deletedCount;
  } catch (error) {
    logger.error('Failed to cleanup old files:', error);
    return 0;
  }
}

// Get file info
export async function getFileInfo(filePath: string): Promise<{ size: number; mimetype: string } | null> {
  try {
    const stats = await fs.stat(filePath);
    return { size: stats.size, mimetype: 'application/octet-stream' };
  } catch (error) {
    logger.error('Failed to get file info:', error);
    return null;
  }
}

// Get storage stats
export async function getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }
    
    return { totalFiles: files.length, totalSize };
  } catch (error) {
    logger.error('Failed to get storage stats:', error);
    return { totalFiles: 0, totalSize: 0 };
  }
}
