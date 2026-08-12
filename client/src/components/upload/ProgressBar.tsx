import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { UploadStage, UploadProgress } from '../../types';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  progress: UploadProgress | null;
  className?: string;
}

const stageConfig = {
  uploading: {
    label: 'Uploading',
    color: 'bg-blue-500',
    icon: Clock,
  },
  compressing: {
    label: 'Compressing',
    color: 'bg-amber-500',
    icon: Clock,
  },
  posting: {
    label: 'Posting',
    color: 'bg-purple-500',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-500',
    icon: XCircle,
  },
};

export function ProgressBar({ progress, className }: ProgressBarProps) {
  if (!progress) {
    return null;
  }

  const config = stageConfig[progress.stage] || stageConfig.uploading;
  const Icon = config.icon;
  const isComplete = progress.stage === 'completed' || progress.stage === 'failed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('space-y-3', className)}
    >
      {/* Stage Indicator */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-3 h-3 rounded-full flex-shrink-0',
            isComplete ? (progress.stage === 'completed' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-current'
          )}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className={cn('w-5 h-5', isComplete ? (progress.stage === 'completed' ? 'text-emerald-500' : 'text-red-500') : 'text-primary')} />
            <span className={cn('font-medium', isComplete ? (progress.stage === 'completed' ? 'text-emerald-500' : 'text-red-500') : 'text-text-primary')}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-text-muted">{progress.message}</p>
        </div>
        
        <span className={cn('text-sm font-medium', isComplete ? (progress.stage === 'completed' ? 'text-emerald-500' : 'text-red-500') : 'text-primary')}>
          {progress.progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', config.color)}
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// Full progress indicator with multiple stages
export function UploadProgressIndicator({ progress }: { progress: UploadProgress | null }) {
  if (!progress) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">Waiting for upload...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressBar progress={progress} />
      
      {progress.stage === 'failed' && (
        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-red-500 text-center">{progress.message}</p>
        </div>
      )}
      
      {progress.stage === 'completed' && (
        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <p className="text-emerald-500 text-center font-medium">
            {progress.message}
          </p>
        </div>
      )}
    </div>
  );
}
