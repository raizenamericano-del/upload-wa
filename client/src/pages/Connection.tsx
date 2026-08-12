import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QrCode, Smartphone, Link, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ConnectionStatus } from '../components/connection/ConnectionStatus';
import { QRCodeDisplay } from '../components/connection/QRCodeDisplay';
import { PairingCode } from '../components/connection/PairingCode';
import { useConnection } from '../hooks/useConnection';
import { Loader } from '../components/common/Loader';

export default function ConnectionPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'qr' | 'pairing'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const {
    connection,
    isConnected,
    isConnecting,
    isWaiting,
    hasError,
    error,
    qrCode,
    pairingCode,
    connect,
    disconnect,
  } = useConnection();

  // Redirect to upload page when connected
  useEffect(() => {
    if (isConnected) {
      navigate('/upload');
    }
  }, [isConnected, navigate]);

  // Initialize connection
  const handleConnect = () => {
    setIsInitializing(true);
    connect(phoneNumber);
    setTimeout(() => setIsInitializing(false), 2000);
  };

  // Refresh QR/Pairing code
  const handleRefresh = () => {
    disconnect();
    setTimeout(() => connect(phoneNumber), 1000);
  };

  // Go back
  const handleBack = () => {
    disconnect();
    navigate('/');
  };

  // Handle method change
  const handleMethodChange = (newMethod: 'qr' | 'pairing') => {
    setMethod(newMethod);
  };

  // Handle phone number change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  // Show loading state
  if (isInitializing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <Loader size="xl" variant="ring" text="Initializing connection..." />
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mt-8"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Connect WhatsApp</h1>
          <p className="text-sm text-text-muted">Link your WhatsApp account to start uploading</p>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus
        status={connection.status}
        error={error}
        phoneNumber={connection.phoneNumber}
        profileName={connection.profileName}
      />

      {/* Method Selection */}
      <AnimatePresence mode="wait">
        {!isWaiting && !isConnected && !hasError && (
          <motion.div
            key="method-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg">
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Choose Connection Method
                  </h2>
                  <p className="text-sm text-text-muted">
                    Select how you want to connect your WhatsApp account
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* QR Code Method */}
                  <motion.button
                    onClick={() => handleMethodChange('qr')}
                    className={`p-6 rounded-xl transition-all border-2 ${
                      method === 'qr'
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light dark:border-border-medium hover:border-primary/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          method === 'qr' ? 'bg-primary' : 'bg-bg-secondary'
                        }`}
                      >
                        <QrCode
                          className={`w-7 h-7 ${
                            method === 'qr' ? 'text-white' : 'text-primary'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">QR Code</h3>
                        <p className="text-sm text-text-muted">Scan with your phone</p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Pairing Code Method */}
                  <motion.button
                    onClick={() => handleMethodChange('pairing')}
                    className={`p-6 rounded-xl transition-all border-2 ${
                      method === 'pairing'
                        ? 'border-primary bg-primary/5'
                        : 'border-border-light dark:border-border-medium hover:border-primary/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          method === 'pairing' ? 'bg-primary' : 'bg-bg-secondary'
                        }`}
                      >
                        <Smartphone
                          className={`w-7 h-7 ${
                            method === 'pairing' ? 'text-white' : 'text-primary'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">Pairing Code</h3>
                        <p className="text-sm text-text-muted">Enter 8-digit code</p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Phone Number Input (for pairing code method) */}
                <AnimatePresence mode="wait">
                  {method === 'pairing' && (
                    <motion.div
                      key="phone-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-4 border-t border-border-light dark:border-border-medium">
                        <label className="text-sm font-medium text-text-primary">
                          Phone Number (optional)
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">+62</span>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={handlePhoneNumberChange}
                              placeholder="81234567890"
                              className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-secondary border border-border-light dark:border-border-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-text-muted">
                          Enter your phone number to pre-fill the pairing process
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connect Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConnect}
                  isLoading={isConnecting}
                  className="w-full"
                  leftIcon={<Link className="w-5 h-5" />}
                >
                  {method === 'qr' ? 'Generate QR Code' : 'Generate Pairing Code'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Display */}
      <AnimatePresence mode="wait">
        {method === 'qr' && isWaiting && qrCode && (
          <motion.div
            key="qr-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QRCodeDisplay qrCode={qrCode} onRefresh={handleRefresh} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pairing Code Display */}
      <AnimatePresence mode="wait">
        {method === 'pairing' && isWaiting && pairingCode && (
          <motion.div
            key="pairing-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PairingCode pairingCode={pairingCode} onRefresh={handleRefresh} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence mode="wait">
        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card padding="lg" className="border-red-500/30 bg-red-500/5">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-500 mb-2">
                  Connection Error
                </h3>
                <p className="text-sm text-red-500/80 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConnect}
                    isLoading={isConnecting}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting Message */}
      <AnimatePresence mode="wait">
        {isWaiting && !qrCode && !pairingCode && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <Card padding="lg">
              <div className="flex flex-col items-center gap-4">
                <Loader size="lg" variant="pulse" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Connecting...
                </h3>
                <p className="text-sm text-text-muted">
                  Please wait while we establish connection with WhatsApp
                </p>
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence mode="wait">
        {(method === 'qr' || method === 'pairing') && isWaiting && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center"
          >
            <Card padding="md" className="bg-amber-500/5 border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> This is an unofficial client. Use at your own risk.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper component for connection method icons
function X() {
  return null;
}
