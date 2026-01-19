// @TASK T0.4 - Input 컴포넌트
// @SPEC docs/planning/05-design-system.md#입력-필드

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * 입력 필드 라벨
   */
  label?: string;

  /**
   * 에러 메시지
   */
  error?: string;

  /**
   * 도움말 텍스트
   */
  helperText?: string;

  /**
   * 전체 너비 여부
   */
  fullWidth?: boolean;
}

/**
 * Input 컴포넌트
 *
 * @example
 * <Input label="이메일" type="email" placeholder="email@example.com" />
 * <Input label="비밀번호" type="password" error="비밀번호가 틀렸습니다" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // id가 없으면 label 기반으로 생성
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // 기본 스타일
            'px-3 py-2',
            'text-base text-gray-900 placeholder:text-gray-400',
            'bg-white',
            'border rounded-md',
            'transition-colors duration-200',
            // Focus 상태
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            // 상태별 스타일
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-gray-300 focus:border-primary focus:ring-primary/20',
            // Disabled 상태
            disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
            // Custom class
            className
          )}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          {...props}
        />

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="text-xs text-gray-600"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-error font-medium"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
