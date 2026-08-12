import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import { CompressionOptions, MediaType, UploadProgress } from '../types';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

// Temporary directory for processing
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, '../../temp');
fs.ensureDirSync(TEMP_DIR);

// Default compression options for WhatsApp Status
const DEFAULT_IMAGE_OPTIONS: CompressionOptions = {
  quality: 85, // WhatsApp recommends 80-90 for good quality
  width: 1920, // Max width for HD
  height: 1080, // Max height for HD
};

const DEFAULT_VIDEO_OPTIONS: CompressionOptions = {
  quality: 85,
  width: 1920,
  height: 1080,
  bitrate: 2000, // 2000 kbps for good quality
  fps: 30, // Standard fps
};

// WhatsApp Status limits
const WHATSAPP_LIMITS = {
  image: {
    maxSize: 16 * 1024 * 1024, // 16 MB
    maxWidth: 1920,
    maxHeight: 1080,
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100 MB (but WhatsApp compresses heavily)
    maxDuration: 30, // 30 seconds
    maxWidth: 1920,
    maxHeight: 1080,
  },
};

export interface CompressionResult {
  success: boolean;
  outputPath?: string;
  originalSize: number;
  compressedSize?: number;
  width?: number;
  height?: number;
  duration?: number; // for video
  error?: string;
}

// Get file type from path
export function getMediaType(filePath: string): MediaType {
  const ext = path.extname(filePath).toLowerCase();
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.3gp'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  
  if (videoExts.includes(ext)) return 'video';
  if (imageExts.includes(ext)) return 'image';
  
  // Try to detect from mimetype
  const mimetype = fs.readFileSync(filePath).toString('hex', 0, 8);
  if (mimetype.startsWith('89504e47')) return 'image'; // PNG
  if (mimetype.startsWith('ffd8ffe')) return 'image'; // JPEG
  if (mimetype.startsWith('47494638')) return 'image'; // GIF
  if (mimetype.startsWith('1a45dfa3')) return 'video'; // WebM
  if (mimetype.startsWith('00000020')) return 'video'; // MP4
  
  return 'image'; // Default
}

// Generate output path
export function generateOutputPath(inputPath: string, suffix: string = 'compressed'): string {
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);
  return path.join(dir, `${baseName}_${suffix}${ext}`);
}

// Get file info
export async function getFileInfo(filePath: string): Promise<{
  width?: number;
  height?: number;
  duration?: number;
  size: number;
  type: MediaType;
}> {
  const stats = await fs.stat(filePath);
  const type = getMediaType(filePath);
  
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Error getting image info:', err);
          return resolve({ size: stats.size, type });
        }
        
        const stream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          width: stream?.width,
          height: stream?.height,
          size: stats.size,
          type,
        });
      });
    } else {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Error getting video info:', err);
          return resolve({ size: stats.size, type });
        }
        
        const stream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          width: stream?.width,
          height: stream?.height,
          duration: metadata.format?.duration ? Math.round(parseFloat(metadata.format.duration)) : undefined,
          size: stats.size,
          type,
        });
      });
    }
  });
}

// Compress image for WhatsApp Status
export async function compressImage(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<CompressionResult> {
  const mergedOptions = { ...DEFAULT_IMAGE_OPTIONS, ...options };
  
  try {
    const fileInfo = await getFileInfo(inputPath);
    const originalSize = fileInfo.size;
    
    // Calculate target dimensions while maintaining aspect ratio
    let targetWidth = mergedOptions.width;
    let targetHeight = mergedOptions.height;
    
    if (fileInfo.width && fileInfo.height) {
      const aspectRatio = fileInfo.width / fileInfo.height;
      
      if (targetWidth && !targetHeight) {
        targetHeight = Math.round(targetWidth / aspectRatio);
      } else if (targetHeight && !targetWidth) {
        targetWidth = Math.round(targetHeight * aspectRatio);
      } else if (targetWidth && targetHeight) {
        // Fit within bounds while maintaining aspect ratio
        const widthRatio = targetWidth / fileInfo.width;
        const heightRatio = targetHeight / fileInfo.height;
        const ratio = Math.min(widthRatio, heightRatio);
        
        targetWidth = Math.round(fileInfo.width * ratio);
        targetHeight = Math.round(fileInfo.height * ratio);
      }
    }
    
    onProgress?.({
      stage: 'compressing',
      progress: 10,
      message: 'Analyzing image...',
    });
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputFormat('image2')
        .outputOptions([
          '-q:v', mergedOptions.quality.toString(),
          '-vf', `scale=${targetWidth || 'iw'}:${targetHeight || 'ih'}:force_original_aspect_ratio=decrease`,
        ])
        .on('progress', (progress) => {
          const pct = Math.round(progress.percent || 0);
          onProgress?.({
            stage: 'compressing',
            progress: 10 + (pct * 0.7),
            message: `Compressing image... ${pct}%`,
          });
        })
        .on('end', async () => {
          try {
            const compressedStats = await fs.stat(outputPath);
            onProgress?.({
              stage: 'compressing',
              progress: 100,
              message: 'Compression complete!',
            });
            
            resolve({
              success: true,
              outputPath,
              originalSize,
              compressedSize: compressedStats.size,
              width: targetWidth,
              height: targetHeight,
            });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          logger.error('Image compression error:', err);
          reject(new Error(`Compression failed: ${err.message}`));
        })
        .save(outputPath);
    });
  } catch (error) {
    logger.error('Error in compressImage:', error);
    return {
      success: false,
      originalSize: 0,
      error: error?.message || 'Failed to compress image',
    };
  }
}

// Compress video for WhatsApp Status
export async function compressVideo(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<CompressionResult> {
  const mergedOptions = { ...DEFAULT_VIDEO_OPTIONS, ...options };
  
  try {
    const fileInfo = await getFileInfo(inputPath);
    const originalSize = fileInfo.size;
    
    // WhatsApp Status video limits
    const maxDuration = WHATSAPP_LIMITS.video.maxDuration;
    const maxWidth = WHATSAPP_LIMITS.video.maxWidth;
    const maxHeight = WHATSAPP_LIMITS.video.maxHeight;
    
    // Calculate target dimensions
    let targetWidth = mergedOptions.width || maxWidth;
    let targetHeight = mergedOptions.height || maxHeight;
    
    if (fileInfo.width && fileInfo.height) {
      const aspectRatio = fileInfo.width / fileInfo.height;
      
      // Fit within WhatsApp limits
      const widthRatio = maxWidth / fileInfo.width;
      const heightRatio = maxHeight / fileInfo.height;
      const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale
      
      targetWidth = Math.round(fileInfo.width * ratio);
      targetHeight = Math.round(fileInfo.height * ratio);
    }
    
    onProgress?.({
      stage: 'compressing',
      progress: 10,
      message: 'Analyzing video...',
    });
    
    // Calculate target bitrate based on resolution
    const targetBitrate = mergedOptions.bitrate || Math.min(
      Math.max(1000, (targetWidth * targetHeight) / 100),
      2500
    );
    
    // Calculate target fps
    const targetFps = mergedOptions.fps || 30;
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputFormat('mp4')
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23', // Good quality
          '-b:v', `${targetBitrate}k`,
          '-maxrate', `${targetBitrate}k`,
          '-bufsize', `${targetBitrate * 2}k`,
          '-r', targetFps.toString(),
          '-vf', `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease`,
          '-c:a', 'aac',
          '-b:a', '128k',
          '-ar', '44100',
          '-ac', '2',
          '-movflags', '+faststart',
        ])
        .duration(maxDuration) // Trim to max duration
        .on('progress', (progress) => {
          const pct = Math.round(progress.percent || 0);
          onProgress?.({
            stage: 'compressing',
            progress: 10 + (pct * 0.7),
            message: `Compressing video... ${pct}%`,
          });
        })
        .on('end', async () => {
          try {
            const compressedStats = await fs.stat(outputPath);
            const compressedInfo = await getFileInfo(outputPath);
            
            onProgress?.({
              stage: 'compressing',
              progress: 100,
              message: 'Compression complete!',
            });
            
            resolve({
              success: true,
              outputPath,
              originalSize,
              compressedSize: compressedStats.size,
              width: compressedInfo.width,
              height: compressedInfo.height,
              duration: compressedInfo.duration,
            });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          logger.error('Video compression error:', err);
          reject(new Error(`Compression failed: ${err.message}`));
        })
        .save(outputPath);
    });
  } catch (error) {
    logger.error('Error in compressVideo:', error);
    return {
      success: false,
      originalSize: 0,
      error: error?.message || 'Failed to compress video',
    };
  }
}

// Compress media (auto-detect type)
export async function compressMedia(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<CompressionResult> {
  const type = getMediaType(inputPath);
  
  onProgress?.({
    stage: 'compressing',
    progress: 0,
    message: `Starting ${type} compression...`,
  });
  
  if (type === 'image') {
    return compressImage(inputPath, outputPath, options, onProgress);
  } else {
    return compressVideo(inputPath, outputPath, options, onProgress);
  }
}

// Optimize for WhatsApp Status (special handling)
export async function optimizeForWhatsAppStatus(
  inputPath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<CompressionResult> {
  const tempDir = TEMP_DIR;
  const outputPath = path.join(tempDir, `kyy_${Date.now()}_${path.basename(inputPath)}`);
  
  const type = getMediaType(inputPath);
  
  // WhatsApp-specific optimizations
  const options: CompressionOptions = type === 'image'
    ? { ...DEFAULT_IMAGE_OPTIONS, quality: 90 }
    : { ...DEFAULT_VIDEO_OPTIONS, bitrate: 2500, fps: 30 };
  
  return compressMedia(inputPath, outputPath, options, onProgress);
}

// Clean up temporary files
export async function cleanupTempFiles(pattern?: string): Promise<void> {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const file of files) {
      if (pattern && !file.includes(pattern)) continue;
      
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 1 hour
      if (now - stats.mtimeMs > oneHour) {
        await fs.unlink(filePath);
        logger.info(`Cleaned up temp file: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning up temp files:', error);
  }
}

// Get compression recommendations for a file
export async function getCompressionRecommendations(filePath: string): Promise<{
  type: MediaType;
  originalSize: number;
  width?: number;
  height?: number;
  duration?: number;
  recommendedOptions: CompressionOptions;
  estimatedCompressedSize: number;
}> {
  const type = getMediaType(filePath);
  const fileInfo = await getFileInfo(filePath);
  
  const isImage = type === 'image';
  const isVideo = type === 'video';
  
  // Calculate estimated compression ratio
  let compressionRatio = isImage ? 0.7 : 0.4; // Image: ~30% reduction, Video: ~60% reduction
  
  // Adjust based on current quality
  if (isImage) {
    if (fileInfo.width && fileInfo.height) {
      const area = fileInfo.width * fileInfo.height;
      const maxArea = WHATSAPP_LIMITS.image.maxWidth * WHATSAPP_LIMITS.image.maxHeight;
      compressionRatio = Math.max(0.5, 1 - (area / maxArea) * 0.3);
    }
  } else if (isVideo) {
    if (fileInfo.duration && fileInfo.duration > WHATSAPP_LIMITS.video.maxDuration) {
      compressionRatio = 0.3; // Need to trim
    }
    if (fileInfo.width && fileInfo.height) {
      const area = fileInfo.width * fileInfo.height;
      const maxArea = WHATSAPP_LIMITS.video.maxWidth * WHATSAPP_LIMITS.video.maxHeight;
      compressionRatio = Math.max(0.3, 0.6 - (area / maxArea) * 0.2);
    }
  }
  
  const estimatedCompressedSize = Math.round(fileInfo.size * compressionRatio);
  
  const recommendedOptions: CompressionOptions = isImage
    ? { ...DEFAULT_IMAGE_OPTIONS, quality: Math.min(95, Math.max(70, 90 - (fileInfo.size / 1024 / 1024) * 5)) }
    : { ...DEFAULT_VIDEO_OPTIONS, bitrate: Math.min(3000, Math.max(1000, 2500 - (fileInfo.size / 1024 / 1024) * 100)) };
  
  return {
    type,
    originalSize: fileInfo.size,
    width: fileInfo.width,
    height: fileInfo.height,
    duration: fileInfo.duration,
    recommendedOptions,
    estimatedCompressedSize,
  };
}
