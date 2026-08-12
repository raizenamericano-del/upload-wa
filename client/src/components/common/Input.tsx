import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none">
              <span className="text-text-muted">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full pl-4 pr-12 py-3 rounded-xl bg-bg-secondary border transition-all duration-200',
              'text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              hasError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-border-light dark:border-border-medium',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 bottom-0 flex items-center pr-4"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-text-muted hover:text-text-primary" />
              ) : (
                <Eye className="w-5 h-5 text-text-muted hover:text-text-primary" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 pointer-events-none">
              <span className="text-text-muted">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {hint && !hasError && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
        
        {hasError && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
