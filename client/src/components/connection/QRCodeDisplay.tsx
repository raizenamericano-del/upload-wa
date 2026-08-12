import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Loader } from '../common/Loader';

interface QRCodeDisplayProps {
  qrCode: string;
  onRefresh?: () => void;
  className?: string;
}

export function QRCodeDisplay({ qrCode, onRefresh, className }: QRCodeDisplayProps) {
  const [qrImage, setQrImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code image
  useEffect(() => {
    if (!qrCode) return;

    setIsLoading(true);

    // Use QRCode library to generate QR code
    QRCode.toDataURL(qrCode, { width: 256, margin: 2 })
      .then((url) => {
        setQrImage(url);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to generate QR code:', error);
        setIsLoading(false);
      });
  }, [qrCode]);

  // Download QR code
  const handleDownload = () => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'whatsapp-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className={className} padding="lg">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader size="lg" variant="ring" text="Generating QR Code..." />
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} padding="lg">
      <div className="flex flex-col items-center gap-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary">Scan QR Code</h3>
          <p className="text-sm text-text-muted">
            Open WhatsApp on your phone and scan this code
          </p>
        </div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg"
        >
          {qrImage ? (
            <img
              src={qrImage}
              alt="WhatsApp QR Code"
              className="w-64 h-64 object-contain"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <p className="text-text-muted">QR Code not available</p>
            </div>
          )}

          {/* Logo Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 12L14 28L18 28L22 20L18 20L18 24L14 24L14 20L10 20L10 12L14 12Z"
                  fill="#0ea5e9"
                />
                <path
                  d="M24 12L28 20L24 28L24 24L20 24L20 20L24 20L24 16L20 12L24 12Z"
                  fill="#8b5cf6"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <div className="text-center text-sm text-text-muted space-y-1">
          <p>
            <strong>On your phone:</strong>
          </p>
          <p>1. Open WhatsApp &rarr; Settings &rarr; Linked Devices</p>
          <p>2. Tap &quot;Link a Device&quot;</p>
          <p>3. Point your phone at this screen to scan the QR code</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download
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
