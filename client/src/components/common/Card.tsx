import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
  glow?: boolean;
}

const cardVariants = {
  variant: {
    default: 'bg-bg-card',
    glass: 'glass-card',
    bordered: 'bg-bg-card border border-border-light dark:border-border-medium',
    elevated: 'bg-bg-card shadow-lg',
  },
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverEffect = false,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300',
          cardVariants.variant[variant],
          cardVariants.padding[padding],
          hoverEffect && 'hover:shadow-xl hover:-translate-y-1',
          glow && 'glow',
          className
        )}
        whileHover={hoverEffect ? { scale: 1.02 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
