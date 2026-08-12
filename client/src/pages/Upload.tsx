import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, Video, Settings, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FileDropzone } from '../components/upload/FileDropzone';
import { MediaPreview } from '../components/upload/MediaPreview';
import { CompressionOptions as CompressionOptionsComponent } from '../components/upload/CompressionOptions';
import { UploadProgressIndicator } from '../components/upload/ProgressBar';
import { useConnection } from '../hooks/useConnection';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/common/Toast';
import { CompressionOptions } from '../types';
import { isImageFile, isVideoFile, formatFileSize } from '../utils/cn';
import { uploadApi } from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const { isConnected, profileName, phoneNumber, sessionId } = useConnection();
  const { socket } = useSocket();
  const { success: showSuccess, error: showError } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [compress, setCompress] = useState(true);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 85,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; progress: number; message: string } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Redirect if not connected
  if (!isConnected) {
    navigate('/connect');
    return null;
  }

  // Handle file drop
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file type
      if (!isImageFile(selectedFile) && !isVideoFile(selectedFile)) {
        showError('Please upload an image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV)');
        return;
      }
      
      // Validate file size (100MB max)
      if (selectedFile.size > 100 * 1024 * 1024) {
        showError('File size exceeds 100MB limit');
        return;
      }
      
      setFile(selectedFile);
    }
  }, [showError]);

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setUploadSuccess(false);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file || !sessionId) return;

    setIsUploading(true);
    setUploadSuccess(false);
    setProgress({ stage: 'uploading', progress: 0, message: 'Starting upload...' });

    try {
      // Set compression options based on file type
      const options = compress
        ? {
            ...compressionOptions,
            ...(isImageFile(file) && { width: 1920, height: 1080 }),
            ...(isVideoFile(file) && { bitrate: 2000, fps: 30 }),
          }
        : {};

      // Use API to upload
      const result = await uploadApi.upload(sessionId, file, compress, options);

      if (result.success) {
        setProgress({ stage: 'completed', progress: 100, message: 'Status berhasil diupload!' });
        setUploadSuccess(true);
        showSuccess('Status berhasil diupload!', 'Upload Successful');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setProgress({ stage: 'failed', progress: 0, message: error?.message || 'Upload failed' });
      showError(error?.message || 'Failed to upload status');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setFile(null);
    setCompress(true);
    setCompressionOptions({ quality: 85 });
    setUploadSuccess(false);
    setProgress(null);
  };

  // Determine media type
  const mediaType = file ? (isImageFile(file) ? 'image' : 'video') : 'auto';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Upload Status</h1>
          <p className="text-sm text-text-muted">
            Upload photos or videos to your WhatsApp Status
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          Back
        </Button>
      </div>

      {/* Connection Info */}
      <Card padding="md" className="bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold">
              {profileName?.charAt(0).toUpperCase() || 'K'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary">{profileName || 'Connected'}</h4>
            <p className="text-sm text-text-muted">{phoneNumber || 'WhatsApp Account'}</p>
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {uploadSuccess ? (
          {/* Success State */}
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Card padding="lg" className="max-w-md mx-auto">
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald-500">Success!</h2>
                  <p className="text-text-muted mt-2">
                    Status berhasil diupload ke WhatsApp
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={handleReset}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Upload Another
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="upload-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* File Dropzone */}
            <FileDropzone onDrop={handleDrop} />

            {/* File Preview */}
            <AnimatePresence mode="wait">
              {file && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MediaPreview file={file} onRemove={handleRemoveFile} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compression Options */}
            <AnimatePresence mode="wait">
              {file && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <CompressionOptionsComponent
                    value={compressionOptions}
                    onChange={setCompressionOptions}
                    mediaType={mediaType}
                  />

                  {/* Compress Toggle */}
                  <Card padding="md" className="mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-text-primary">Compress for HD</h4>
                        <p className="text-sm text-text-muted">
                          Optimize file size while maintaining HD quality
                        </p>
                      </div>
                      <Button
                        variant={compress ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCompress(!compress)}
                      >
                        {compress ? 'HD Compression On' : 'No Compression'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            <AnimatePresence mode="wait">
              {file && !isUploading && (
                <motion.div
                  key="upload-button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex justify-center"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUpload}
                    isLoading={isUploading}
                    leftIcon={<Upload className="w-5 h-5" />}
                    className="min-w-[200px]"
                  >
                    Upload to Status
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Progress */}
            <AnimatePresence mode="wait">
              {isUploading && progress && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card padding="lg">
                    <UploadProgressIndicator progress={progress} />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            <AnimatePresence mode="wait">
              {!file && !isUploading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12"
                >
                  <Card padding="lg">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center">
                        <Upload className="w-8 h-8 text-text-muted" />
                      </div>
                      <h3 className="font-semibold text-text-primary">
                        Drag & Drop or Click to Upload
                      </h3>
                      <p className="text-sm text-text-muted">
                        Supported: Images (JPG, PNG, WebP, GIF) and Videos (MP4, WebM, MOV)
                      </p>
                      <p className="text-xs text-text-muted">
                        Max size: 100MB
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <Card padding="md" className="bg-amber-500/5 border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-600 dark:text-amber-400">Tips for Best Quality</h4>
            <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-2 space-y-1">
              <li>• Use landscape orientation for videos</li>
              <li>• Keep videos under 30 seconds for best results</li>
              <li>• HD compression maintains quality while reducing file size</li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
