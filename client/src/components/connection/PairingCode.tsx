import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { toast } from 'react-hot-toast';

interface PairingCodeProps {
  pairingCode: string;
  onRefresh?: () => void;
  className?: string;
}

export function PairingCode({ pairingCode, onRefresh, className }: PairingCodeProps) {
  const [displayCode, setDisplayCode] = useState(pairingCode);

  // Update display code when pairingCode changes
  useEffect(() => {
    setDisplayCode(pairingCode);
  }, [pairingCode]);

  // Copy to clipboard
  const handleCopy = () => {
    if (!displayCode) return;

    navigator.clipboard.writeText(displayCode)
      .then(() => {
        toast.success('Pairing code copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy pairing code');
      });
  };

  // Format code for display (add spaces every 2 characters)
  const formattedCode = displayCode?.replace(/(\d{2})/g, '$1 ').trim() || '';

  return (
    <Card className={className} padding="lg">
      <div className="flex flex-col items-center gap-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary">Pairing Code</h3>
          <p className="text-sm text-text-muted">
            Enter this code on your phone
          </p>
        </div>

        {/* Pairing Code Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="flex gap-2">
            {formattedCode.split(' ').map((chunk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="w-12 h-14 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border-2 border-primary/30"
              >
                <span className="text-2xl font-mono font-bold gradient-text">
                  {chunk}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Instructions */}
        <div className="text-center text-sm text-text-muted space-y-1">
          <p>
            <strong>On your phone:</strong>
          </p>
          <p>1. Open WhatsApp &rarr; Settings &rarr; Linked Devices</p>
          <p>2. Tap &quot;Link a Device&quot;</p>
          <p>3. Select &quot;Use pairing code instead&quot;</p>
          <p>4. Enter the 8-digit code above</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            leftIcon={<Copy className="w-4 h-4" />}
          >
            Copy Code
          </Button>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
