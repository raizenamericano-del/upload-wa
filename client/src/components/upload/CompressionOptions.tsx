import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider, Switch } from '@radix-ui/react-slider';
import { Settings, ChevronDown, ChevronUp, Image, Video } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { CompressionOptions as CompressionOptionsType } from '../../types';

interface CompressionOptionsProps {
  value: CompressionOptionsType;
  onChange: (options: CompressionOptionsType) => void;
  mediaType: 'image' | 'video' | 'auto';
  className?: string;
}

const defaultImageOptions: CompressionOptionsType = {
  quality: 85,
  width: 1920,
  height: 1080,
};

const defaultVideoOptions: CompressionOptionsType = {
  quality: 85,
  width: 1920,
  height: 1080,
  bitrate: 2000,
  fps: 30,
};

export function CompressionOptions({
  value,
  onChange,
  mediaType,
  className,
}: CompressionOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVideo = mediaType === 'video' || mediaType === 'auto';
  const isImage = mediaType === 'image' || mediaType === 'auto';

  // Handle option change
  const handleChange = (key: keyof CompressionOptionsType, val: number) => {
    onChange({ ...value, [key]: val });
  };

  // Reset to defaults
  const handleReset = () => {
    const defaults = isVideo ? defaultVideoOptions : defaultImageOptions;
    onChange(defaults);
  };

  return (
    <Card className={className} padding="md">
      <div className="space-y-4">
        {/* Header */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-text-muted" />
            <div>
              <h4 className="font-semibold text-text-primary">Compression Options</h4>
              <p className="text-sm text-text-muted">
                Optimize for WhatsApp Status HD
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </motion.div>
        </motion.button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-4 pt-4 border-t border-border-light dark:border-border-medium"
            >
              {/* Presets */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onChange(isVideo ? defaultVideoOptions : defaultImageOptions)}
                  className="flex-1"
                >
                  Default
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onChange({ ...value, quality: 95 })}
                  className="flex-1"
                >
                  High Quality
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onChange({ ...value, quality: 75 })}
                  className="flex-1"
                >
                  Fast Upload
                </Button>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary">
                    Quality
                  </label>
                  <span className="text-sm text-text-muted">
                    {value.quality || (isVideo ? defaultVideoOptions.quality : defaultImageOptions.quality)}%
                  </span>
                </div>
                <Slider
                  value={[value.quality || (isVideo ? defaultVideoOptions.quality : defaultImageOptions.quality)]}
                  onValueChange={(vals) => handleChange('quality', vals[0])}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                >
                  <Slider.Track className="h-2 rounded-full bg-bg-secondary relative">
                    <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
                  </Slider.Track>
                  <Slider.Thumb className="w-5 h-5 rounded-full bg-primary shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </Slider>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Video Specific Options */}
              <AnimatePresence mode="wait">
                {isVideo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-4"
                  >
                    {/* Bitrate Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">
                          Bitrate (kbps)
                        </label>
                        <span className="text-sm text-text-muted">
                          {value.bitrate || defaultVideoOptions.bitrate}
                        </span>
                      </div>
                      <Slider
                        value={[value.bitrate || defaultVideoOptions.bitrate]}
                        onValueChange={(vals) => handleChange('bitrate', vals[0])}
                        min={500}
                        max={5000}
                        step={500}
                        className="w-full"
                      >
                        <Slider.Track className="h-2 rounded-full bg-bg-secondary relative">
                          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
                        </Slider.Track>
                        <Slider.Thumb className="w-5 h-5 rounded-full bg-primary shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Slider>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>500</span>
                        <span>5000</span>
                      </div>
                    </div>

                    {/* FPS Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">
                          FPS
                        </label>
                        <span className="text-sm text-text-muted">
                          {value.fps || defaultVideoOptions.fps}
                        </span>
                      </div>
                      <Slider
                        value={[value.fps || defaultVideoOptions.fps]}
                        onValueChange={(vals) => handleChange('fps', vals[0])}
                        min={15}
                        max={60}
                        step={5}
                        className="w-full"
                      >
                        <Slider.Track className="h-2 rounded-full bg-bg-secondary relative">
                          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-primary to-secondary" />
                        </Slider.Track>
                        <Slider.Thumb className="w-5 h-5 rounded-full bg-primary shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Slider>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>15</span>
                        <span>60</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full text-text-muted hover:text-text-primary"
              >
                Reset to Defaults
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
