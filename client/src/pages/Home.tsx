import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, QrCode, Link, ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useConnection } from '../hooks/useConnection';
import Logo from '../components/common/Logo';

export default function HomePage() {
  const navigate = useNavigate();
  const { isConnected, profileName, phoneNumber, disconnect } = useConnection();

  // Feature cards
  const features = [
    {
      icon: QrCode,
      title: 'Easy Connection',
      description: 'Connect your WhatsApp account with QR Code or pairing code',
      color: 'from-primary to-secondary',
    },
    {
      icon: Upload,
      title: 'HD Upload',
      description: 'Upload photos and videos with optimal compression for HD quality',
      color: 'from-secondary to-accent',
    },
    {
      icon: Link,
      title: 'Direct Posting',
      description: 'Post directly to your WhatsApp Status without saving locally',
      color: 'from-accent to-primary',
    },
  ];

  // Quick actions for connected users
  const quickActions = [
    {
      label: 'Upload Status',
      description: 'Upload a new photo or video',
      onClick: () => navigate('/upload'),
      icon: Upload,
      color: 'bg-primary',
    },
    {
      label: 'View History',
      description: 'See your upload history',
      onClick: () => navigate('/history'),
      icon: Link,
      color: 'bg-secondary',
    },
    {
      label: 'Settings',
      description: 'Configure your preferences',
      onClick: () => navigate('/settings'),
      icon: Link,
      color: 'bg-accent',
    },
  ];

  // Disconnect and connect again
  const handleDisconnect = () => {
    disconnect();
    navigate('/connect');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex justify-center mb-6"
        >
          <Logo animate className="w-20 h-20" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl sm:text-5xl font-bold gradient-text mb-4"
        >
          KyyStatus HD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-text-secondary max-w-2xl mx-auto"
        >
          Upload WhatsApp Status with HD quality compression. Connect your account and start uploading in seconds.
        </motion.p>

        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 max-w-md mx-auto"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Unofficial client. Gunakan dengan risiko sendiri.
            </p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          {isConnected ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/upload')}
                leftIcon={<Upload className="w-5 h-5" />}
                className="min-w-[200px]"
              >
                Upload Status
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDisconnect}
                className="min-w-[200px]"
              >
                Change Account
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/connect')}
              leftIcon={<QrCode className="w-5 h-5" />}
              className="min-w-[200px]"
            >
              Connect WhatsApp
            </Button>
          )}
        </motion.div>
      </motion.section>

      {/* Connection Status */}
      {isConnected && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="py-8"
        >
          <Card padding="lg" className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profileName?.charAt(0).toUpperCase() || 'K'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">{profileName || 'Connected'}</h3>
                <p className="text-sm text-text-muted">{phoneNumber || 'WhatsApp Account'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/upload')}
                >
                  Upload
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-500 hover:text-red-400"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </Card>
        </motion.section>
      )}

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="py-8"
      >
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
          Features
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <Card padding="lg" className="h-full">
                <div className="flex flex-col items-center text-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-text-primary">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quick Actions for Connected Users */}
      {isConnected && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="py-8"
        >
          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            Quick Actions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                onClick={action.onClick}
                className="w-full"
              >
                <Card
                  padding="lg"
                  className="h-full hover:border-primary/30 transition-colors group"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                    >
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{action.label}</h3>
                    <p className="text-sm text-text-muted">{action.description}</p>
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="py-8 text-center text-sm text-text-muted border-t border-border-light dark:border-border-medium"
      >
        <p>
          Made with ❤️ by <span className="font-semibold text-primary">KyyDevv</span>
        </p>
        <p className="mt-2">
          Version 1.0.0 | WhatsApp Status Uploader
        </p>
      </motion.footer>
    </motion.div>
  );
}
