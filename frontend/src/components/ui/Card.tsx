// @TASK T0.4 - Card 컴포넌트
// @SPEC docs/planning/05-design-system.md#카드

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 인터랙티브 카드 여부 (hover 효과 추가)
   */
  interactive?: boolean;

  /**
   * 패딩 크기
   * - none: 패딩 없음
   * - sm: 16px
   * - md: 24px (기본)
   * - lg: 32px
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * 그림자 크기
   * - none: 그림자 없음
   * - sm: 작은 그림자 (기본)
   * - md: 중간 그림자
   * - lg: 큰 그림자
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const cardVariants = {
  padding: {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  shadow: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
};

/**
 * Card 컴포넌트
 *
 * @example
 * <Card>
 *   <h3>카드 제목</h3>
 *   <p>카드 내용</p>
 * </Card>
 *
 * <Card interactive padding="lg" shadow="md">
 *   <h3>인터랙티브 카드</h3>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      interactive = false,
      padding = 'md',
      shadow = 'sm',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // 기본 스타일
          'bg-white',
          'border border-gray-200',
          'rounded-lg',
          'transition-all duration-200',
          // Variants
          cardVariants.padding[padding],
          cardVariants.shadow[shadow],
          // Interactive 효과
          interactive && [
            'cursor-pointer',
            'hover:shadow-md hover:border-primary-light hover:-translate-y-0.5',
            'active:translate-y-0',
          ],
          // Custom class
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader - 카드 헤더 영역
 */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1.5 mb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * CardTitle - 카드 제목
 */
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-xl font-semibold text-gray-900', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * CardDescription - 카드 설명
 */
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-600', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

/**
 * CardContent - 카드 본문
 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-base text-gray-700', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * CardFooter - 카드 푸터 (버튼 영역 등)
 */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-3 mt-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
