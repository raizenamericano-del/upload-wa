import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, Video, X, FileText } from 'lucide-react';
import { Card } from '../common/Card';
import { toast } from 'react-hot-toast';
import { cn, formatFileSize } from '../../utils/cn';

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

const defaultAcceptedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/3gpp',
];

const defaultMaxSize = 100 * 1024 * 1024; // 100 MB

export function FileDropzone({
  onDrop,
  acceptedTypes = defaultAcceptedTypes,
  maxSize = defaultMaxSize,
  maxFiles = 1,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);

  const onDropCallback = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          if (file.file.size > maxSize) {
            toast.error(`File "${file.file.name}" is too large. Max size: ${formatFileSize(maxSize)}`);
          } else {
            toast.error(`File "${file.file.name}" is not a supported type`);
          }
        });
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Create preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
            setFileInfo({
              name: file.name,
              size: file.size,
              type: 'image',
            });
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
            setFileInfo({
              name: file.name,
              size: file.size,
              type: 'video',
            });
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
          setFileInfo({
            name: file.name,
            size: file.size,
            type: 'file',
          });
        }

        onDrop(acceptedFiles);
      }
    },
    [onDrop, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop: onDropCallback,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  const handleRemove = () => {
    setPreview(null);
    setFileInfo(null);
  };

  const isActive = isDragActive && !isDragReject;
  const isReject = isDragReject || fileRejections.length > 0;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        isActive && 'border-2 border-primary bg-primary/5',
        isReject && 'border-2 border-red-500 bg-red-500/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      padding="lg"
      hoverEffect
    >
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center min-h-[200px] gap-4"
      >
        <input {...getInputProps()} />
        
        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm"
          >
            {fileInfo?.type === 'image' && (
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded-xl"
              />
            )}
            {fileInfo?.type === 'video' && (
              <video
                src={preview}
                className="w-full max-h-48 object-contain rounded-xl"
                controls
              />
            )}
            {fileInfo?.type === 'file' && (
              <div className="flex items-center gap-3 p-6 bg-bg-secondary rounded-xl">
                <FileText className="w-12 h-12 text-primary" />
                <div>
                  <p className="font-medium">{fileInfo.name}</p>
                  <p className="text-sm text-text-muted">{formatFileSize(fileInfo.size)}</p>
                </div>
              </div>
            )}
            
            {/* Remove Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Dropzone Content */}
        {!preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isReject ? (
                <X className="w-8 h-8 text-red-500" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </motion.div>

            {/* Text */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {isReject ? 'Unsupported file type' : isActive ? 'Drop your file here' : 'Upload Media'}
              </h3>
              <p className="text-sm text-text-muted">
                {isReject
                  ? 'Please upload images (JPG, PNG, WebP, GIF) or videos (MP4, WebM, MOV)'
                  : isActive
                  ? 'Supported: Images & Videos'
                  : 'Drag & drop or click to browse'}
              </p>
            </div>

            {/* File Type Icons */}
            <div className="flex gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.2, y: -5 }}
                className="flex flex-col items-center gap-1 text-text-muted"
              >
                <Image className="w-6 h-6" />
                <span className="text-xs">Image</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, y: -5 }}
                className="flex flex-col items-center gap-1 text-text-muted"
              >
                <Video className="w-6 h-6" />
                <span className="text-xs">Video</span>
              </motion.div>
            </div>

            {/* File Size Limit */}
            <p className="text-xs text-text-muted pt-2">
              Max size: {formatFileSize(maxSize)}
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
