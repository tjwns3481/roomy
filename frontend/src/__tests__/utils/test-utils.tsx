// @TASK T0.5.3 - 테스트 유틸리티 함수
// @SPEC docs/planning/07-coding-convention.md#테스트-작성-가이드

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * 테스트용 렌더링 함수
 * 모든 필요한 프로바이더를 자동으로 설정합니다.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * userEvent 설정
 */
export function setupUser() {
  return userEvent.setup()
}

/**
 * 비동기 대기 유틸리티
 */
export function waitFor(callback: () => void, options?: { timeout?: number }) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      try {
        callback()
        clearInterval(checkInterval)
        resolve(true)
      } catch (error) {
        if (
          options?.timeout &&
          Date.now() - startTime > options.timeout
        ) {
          clearInterval(checkInterval)
          throw error
        }
      }
    }, 50)
  })
}

/**
 * API 응답 Mock 생성 유틸리티
 */
export function createMockApiResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  }
}

/**
 * API 에러 응답 Mock
 */
export function createMockApiError(message: string, status = 400) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
  }
}

/**
 * 테스트 가이드 데이터 생성
 */
export function createMockGuide(overrides?: Partial<any>) {
  return {
    id: 'guide_test_123',
    userId: 'user_test_123',
    title: 'Test Guide',
    slug: 'test-guide',
    description: 'Test guide description',
    coverImage: 'https://example.com/image.jpg',
    isPublished: false,
    theme: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Pretendard',
      borderRadius: 'md',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * 테스트 블록 데이터 생성
 */
export function createMockBlock(overrides?: Partial<any>) {
  return {
    id: 'block_test_123',
    guideId: 'guide_test_123',
    type: 'HERO',
    position: 0,
    content: {
      title: 'Welcome',
      subtitle: 'Test subtitle',
      backgroundImage: 'https://example.com/bg.jpg',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * 테스트 사용자 데이터 생성
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    id: 'user_test_123',
    externalId: 'clerk_user_123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    plan: 'FREE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Re-export everything from @testing-library/react
 */
export * from '@testing-library/react'
export { userEvent }
