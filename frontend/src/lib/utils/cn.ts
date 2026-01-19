// @TASK T0.4 - cn 유틸리티 함수
// @SPEC docs/planning/05-design-system.md#컴포넌트

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스를 병합하는 유틸리티 함수
 * 조건부 클래스와 외부 오버라이드를 지원합니다.
 *
 * @example
 * cn('text-base', isActive && 'text-primary', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
