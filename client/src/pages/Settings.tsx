import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Palette, Bell, Shield, Info, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Switch } from '@radix-ui/react-switch';
import { useTheme } from '../hooks/useTheme';
import { useConnection } from '../hooks/useConnection';

export default function SettingsPage() {
  const { isDark, setTheme, toggleTheme } = useTheme();
  const { disconnect } = useConnection();
  
  const [notifications, setNotifications] = useState(true);
  const [autoCompress, setAutoCompress] = useState(true);
  const [quality, setQuality] = useState(85);

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    window.location.href = '/connect';
  };

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
          onClick={() => (window.location.href = '/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted">Configure your preferences</p>
        </div>
      </div>

      {/* Appearance Section */}
      <Card padding="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">Appearance</h2>
              <p className="text-sm text-text-muted">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">Theme</h3>
                <p className="text-sm text-text-muted">Choose your color scheme</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isDark ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleThemeChange('light')}
                  leftIcon={<Sun className="w-4 h-4" />}
                >
                  Light
                </Button>
                <Button
                  variant={!isDark ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleThemeChange('dark')}
                  leftIcon={<Moon className="w-4 h-4" />}
                >
                  Dark
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleThemeChange('system')}
                  leftIcon={<Palette className="w-4 h-4" />}
                >
                  System
                </Button>
              </div>
            </div>

            {/* Auto Theme */}
            <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-medium">
              <div>
                <h3 className="font-medium text-text-primary">Auto Theme</h3>
                <p className="text-sm text-text-muted">Match system preferences</p>
              </div>
              <Switch
                checked={false}
                onCheckedChange={(checked) => handleThemeChange(checked ? 'system' : isDark ? 'dark' : 'light')}
                className="w-10 h-6"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Settings */}
      <Card padding="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">Upload Settings</h2>
              <p className="text-sm text-text-muted">Configure default upload options</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Auto Compress */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">Auto Compress</h3>
                <p className="text-sm text-text-muted">Automatically compress for HD quality</p>
              </div>
              <Switch
                checked={autoCompress}
                onCheckedChange={setAutoCompress}
                className="w-10 h-6"
              />
            </div>

            {/* Quality Preset */}
            <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-medium">
              <div>
                <h3 className="font-medium text-text-primary">Quality Preset</h3>
                <p className="text-sm text-text-muted">Default compression quality</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={quality === 95 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setQuality(95)}
                >
                  High
                </Button>
                <Button
                  variant={quality === 85 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setQuality(85)}
                >
                  Medium
                </Button>
                <Button
                  variant={quality === 75 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setQuality(75)}
                >
                  Fast
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card padding="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">Notifications</h2>
              <p className="text-sm text-text-muted">Manage notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-text-primary">Upload Notifications</h3>
                <p className="text-sm text-text-muted">Show notifications for uploads</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                className="w-10 h-6"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Account Section */}
      <Card padding="lg" className="border-red-500/20 bg-red-500/5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-red-500">Account</h2>
              <p className="text-sm text-red-500/80">Manage your WhatsApp connection</p>
            </div>
          </div>

          <div className="pt-4 border-t border-red-500/20">
            <Button
              variant="danger"
              onClick={handleDisconnect}
              leftIcon={<Shield className="w-5 h-5" />}
              className="w-full"
            >
              Disconnect WhatsApp
            </Button>
            <p className="text-xs text-red-500/70 text-center mt-2">
              This will remove your session and clear all data
            </p>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card padding="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">About</h2>
              <p className="text-sm text-text-muted">KyyStatus HD Information</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-light dark:border-border-medium space-y-4">
            <div className="flex justify-between">
              <span className="text-text-secondary">Version</span>
              <span className="font-medium text-text-primary">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Developer</span>
              <span className="font-medium text-primary">KyyDevv</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Technology</span>
              <span className="font-medium text-text-primary">Baileys, React, Node.js</span>
            </div>
          </div>

          <div className="pt-4 text-center text-sm text-text-muted">
            <p>Unofficial WhatsApp client. Use at your own risk.</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
