import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, X, PlayCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatFileSize } from '../../utils/cn';

interface MediaPreviewProps {
  file: File | null;
  onRemove: () => void;
  className?: string;
}

export function MediaPreview({ file, onRemove, className }: MediaPreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate preview when file changes
  useEffect(() => {
    if (!file) {
      setPreview(null);
      setIsVideo(false);
      return;
    }

    const isVideoFile = file.type.startsWith('video/');
    setIsVideo(isVideoFile);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    return () => {
      reader.abort();
    };
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <Card className={className} padding="md">
      <div className="relative">
        {/* Media */}
        <div className="relative overflow-hidden rounded-xl">
          {isVideo ? (
            <>
              <video
                src={preview || ''}
                className="w-full max-h-64 object-contain"
                controls={isPlaying}
              />
              {!isPlaying && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <PlayCircle className="w-16 h-16 text-white" />
                </motion.button>
              )}
            </>
          ) : (
            <img
              src={preview || ''}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
          )}
        </div>

        {/* Remove Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg z-10"
        >
          <X className="w-4 h-4" />
        </motion.button>

        {/* File Info */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h4 className="font-medium text-text-primary truncate max-w-[200px]">
              {file.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                {isVideo ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                {isVideo ? 'Video' : 'Image'}
              </span>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-400"
          >
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}
