import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

export default function Logo({ className = '', animate = false }: LogoProps) {
  const { isDark } = useTheme();

  if (animate) {
    return (
      <motion.div
        className={`relative flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <KyyLogo isDark={isDark} />
      </motion.div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <KyyLogo isDark={isDark} />
    </div>
  );
}

function KyyLogo({ isDark }: { isDark: boolean }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Background Circle */}
      <circle
        cx="20"
        cy="20"
        r="20"
        fill="url(#logoGradient)"
      />
      
      {/* K Letter */}
      <path
        d="M14 12L14 28L18 28L22 20L18 20L18 24L14 24L14 20L10 20L10 12L14 12Z"
        fill="white"
      />
      
      {/* Y Letter */}
      <path
        d="M24 12L28 20L24 28L24 24L20 24L20 20L24 20L24 16L20 12L24 12Z"
        fill="white"
      />
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      
      {/* Glow Effect */}
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  );
}
