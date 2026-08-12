import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useConnection } from '../../hooks/useConnection';
import { Button } from '../common/Button';
import { 
  Home, 
  Upload, 
  History, 
  Settings, 
  Plug, 
  X,
  Menu,
  ChevronLeft
} from 'lucide-react';
import Logo from '../common/Logo';

interface SidebarProps {
  mobile?: boolean;
}

const navItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/upload', icon: Upload, label: 'Upload Status' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const sidebarVariants = {
  open: { width: 'var(--sidebar-width)', transition: { duration: 0.3 } },
  closed: { width: 0, transition: { duration: 0.3 } },
};

const mobileSidebarVariants = {
  open: { x: 0, transition: { duration: 0.3 } },
  closed: { x: '-100%', transition: { duration: 0.3 } },
};

export default function Sidebar({ mobile = false }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isConnected, disconnect } = useConnection();

  if (mobile) {
    return (
      <motion.div
        initial="closed"
        animate="open"
        variants={mobileSidebarVariants}
        className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-bg-primary border-r border-border-light dark:border-border-medium shadow-xl"
      >
        <div className="p-4 border-b border-border-light dark:border-border-medium">
          <div className="flex items-center justify-between">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-xl gradient-text">KyyStatus HD</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-bg-secondary"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => navigate(item.to)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-text-secondary hover:bg-bg-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {isConnected && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light dark:border-border-medium bg-bg-secondary">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                disconnect();
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.aside
      initial="closed"
      animate="open"
      variants={sidebarVariants}
      className="fixed left-0 top-0 bottom-0 z-40 bg-bg-primary border-r border-border-light dark:border-border-medium"
    >
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-xl gradient-text">KyyStatus HD</h1>
            <p className="text-xs text-text-muted">by KyyDevv</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              
              return (
                <motion.li key={item.to} whileHover={{ scale: 1.02 }}>
                  <NavLink
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-text-secondary hover:bg-bg-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </motion.li>
              );
            })}
          </ul>
        </nav>
        
        {/* Connection Status */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border-light dark:border-border-medium">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isConnected ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}>
              <Plug className={`w-5 h-5 ${
                isConnected ? 'text-emerald-500' : 'text-amber-500'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-text-muted">
                WhatsApp Connection
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
