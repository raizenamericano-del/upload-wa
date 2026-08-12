import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'ring' | 'wave';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Loader({
  size = 'md',
  variant = 'spinner',
  className,
  text,
}: LoaderProps) {
  const { isDark } = useTheme();

  switch (variant) {
    case 'dots':
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full bg-primary',
                  sizeClasses[size]
                )}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
          {text && <span className="text-sm text-text-muted">{text}</span>}
        </div>
      );

    case 'pulse':
      return (
        <div className="flex items-center gap-2">
          <motion.div
            className={cn(
              'rounded-full bg-primary',
              sizeClasses[size],
              className
            )}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {text && <span className="text-sm text-text-muted">{text}</span>}
        </div>
      );

    case 'ring':
      return (
        <div className="relative flex items-center gap-2">
          <div
            className={cn(
              'absolute rounded-full border-4 border-primary/20',
              sizeClasses[size],
              className
            )}
          />
          <motion.div
            className={cn(
              'absolute rounded-full border-4 border-t-primary',
              sizeClasses[size],
              className
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          {text && (
            <span
              className={cn(
                'ml-10 text-sm text-text-muted',
                size === 'sm' && 'ml-8',
                size === 'xl' && 'ml-14'
              )}
            >
              {text}
            </span>
          )}
        </div>
      );

    case 'wave':
      return (
        <div className="flex items-center gap-2">
          <div className="relative">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'absolute w-2 rounded-full bg-primary',
                  sizeClasses[size]
                )}
                style={{ left: `${i * 4}px` }}
                animate={{ height: ['20%', '100%', '20%'] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
              />
            ))}
          </div>
          {text && <span className="text-sm text-text-muted">{text}</span>}
        </div>
      );

    case 'spinner':
    default:
      return (
        <div className="flex items-center gap-2">
          <motion.div
            className={cn(
              'rounded-full border-4 border-primary/20 border-t-primary',
              sizeClasses[size],
              className
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          {text && <span className="text-sm text-text-muted">{text}</span>}
        </div>
      );
  }
}

// Full page loader
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <Loader size="xl" variant="ring" />
        <p className="text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

// Skeleton loader
export interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  className,
  lines = 1,
  width = '100%',
  height = '1rem',
  variant = 'text',
}: SkeletonProps) {
  if (variant === 'circular') {
    return (
      <div
        className={cn('rounded-full shimmer', className)}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn('rounded-xl shimmer', className)}
        style={{ width, height }}
      />
    );
  }

  // Text variant
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('rounded-full shimmer', className)}
          style={{
            width: i === lines - 1 ? '75%' : width,
            height,
          }}
        />
      ))}
    </div>
  );
}
