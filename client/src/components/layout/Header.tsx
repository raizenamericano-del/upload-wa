import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useConnection } from '../../hooks/useConnection';
import { Button } from '../common/Button';
import { Sun, Moon, Smartphone, User, X } from 'lucide-react';
import Logo from '../common/Logo';

export default function Header() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected, profileName, disconnect } = useConnection();

  // Check if current page is connection page
  const isConnectionPage = location.pathname === '/' || location.pathname === '/connect';

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-lg border-b border-border-light dark:border-border-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--header-height)]">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="hidden sm:block font-bold text-xl gradient-text">
                KyyStatus HD
              </span>
            </Link>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-text-muted">
              <span>/</span>
              <span className="capitalize">{location.pathname.replace('/', '') || 'Home'}</span>
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              title={`Toggle ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>
            
            {/* Connection Status */}
            {isConnected && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-primary">{profileName || 'Connected'}</span>
              </div>
            )}
            
            {/* Disconnect Button */}
            {isConnected && !isConnectionPage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnect}
                className="flex items-center gap-2 text-red-500 hover:text-red-400"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
            
            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <Smartphone className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
