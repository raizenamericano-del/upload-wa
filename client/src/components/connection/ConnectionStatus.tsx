import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Plug, XCircle, AlertTriangle } from 'lucide-react';
import { ConnectionStatus } from '../../types';
import { cn } from '../../utils/cn';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  error?: string;
  phoneNumber?: string;
  profileName?: string;
  className?: string;
}

const statusConfig = {
  disconnected: {
    icon: Plug,
    label: 'Disconnected',
    color: 'text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    dotColor: 'bg-gray-400',
    description: 'Not connected to WhatsApp',
  },
  connecting: {
    icon: Clock,
    label: 'Connecting',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    dotColor: 'bg-amber-500',
    description: 'Establishing connection...',
  },
  waiting: {
    icon: Clock,
    label: 'Waiting',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    dotColor: 'bg-blue-500',
    description: 'Scan QR Code or enter pairing code',
  },
  connected: {
    icon: CheckCircle,
    label: 'Connected',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    dotColor: 'bg-emerald-500',
    description: 'Connected to WhatsApp',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    dotColor: 'bg-red-500',
    description: 'Connection error occurred',
  },
};

export function ConnectionStatus({
  status,
  error,
  phoneNumber,
  profileName,
  className,
}: ConnectionStatusProps) {
  const config = useMemo(() => statusConfig[status] || statusConfig.disconnected, [status]);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl',
        config.bgColor,
        className
      )}
    >
      <div className="relative">
        <div className={cn('w-3 h-3 rounded-full', config.dotColor)} />
        {status === 'connecting' || status === 'waiting' ? (
          <motion.div
            className={cn('absolute w-3 h-3 rounded-full', config.dotColor, 'opacity-70')}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ) : null}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', config.color)} />
          <span className={cn('font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        
        {status === 'connected' && profileName && (
          <p className="text-sm text-text-secondary truncate">
            {profileName}
            {phoneNumber && ` (${phoneNumber})`}
          </p>
        )}
        
        {status !== 'connected' && !error && (
          <p className="text-sm text-text-muted truncate">{config.description}</p>
        )}
        
        {error && (
          <p className="text-sm text-red-500 truncate">{error}</p>
        )}
      </div>
    </motion.div>
  );
}

// Simplified status indicator
export function StatusIndicator({
  status,
  className,
}: {
  status: ConnectionStatus;
  className?: string;
}) {
  const config = useMemo(() => statusConfig[status] || statusConfig.disconnected, [status]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      <span className={cn('text-sm font-medium', config.color)}>
        {config.label}
      </span>
    </div>
  );
}
