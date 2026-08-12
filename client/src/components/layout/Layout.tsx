import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../hooks/useTheme';

export default function Layout() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen bg-bg-primary transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden lg:block lg:w-[var(--sidebar-width)]">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </main>
          
          {/* Mobile Navigation */}
          <div className="lg:hidden mobile-nav">
            <Sidebar mobile />
          </div>
        </div>
      </div>
    </div>
  );
}
