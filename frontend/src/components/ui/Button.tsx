// @TASK T0.4 - Button 컴포넌트
// @SPEC docs/planning/05-design-system.md#버튼

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 변형
   * - primary: 주요 액션
   * - secondary: 보조 액션
   * - ghost: 덜 중요한 액션
   * - danger: 위험한 액션
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /**
   * 버튼 크기
   * - sm: 32px height
   * - md: 40px height
   * - lg: 48px height
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 전체 너비 여부
   */
  fullWidth?: boolean;

  /**
   * 로딩 상태
   */
  isLoading?: boolean;
}

const buttonVariants = {
  variant: {
    primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
  },
  size: {
    sm: 'h-8 px-4 text-sm',
    md: 'h-10 px-5 text-base',
    lg: 'h-12 px-6 text-lg',
  },
};

/**
 * Button 컴포넌트
 *
 * @example
 * <Button variant="primary" size="md">클릭하세요</Button>
 * <Button variant="secondary" isLoading>로딩 중...</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 기본 스타일
          'inline-flex items-center justify-center',
          'font-medium rounded-md',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          // Variants
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          // Full width
          fullWidth && 'w-full',
          // Loading state
          isLoading && 'cursor-wait',
          // Custom class
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
