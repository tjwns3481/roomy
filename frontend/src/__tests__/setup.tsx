/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @next/next/no-img-element */
import '@testing-library/jest-dom'
import { afterEach, vi, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '../mocks/server'

// ============================================================================
// MSW Setup (Node 환경)
// ============================================================================

/**
 * MSW Node 서버 시작
 * 모든 테스트 전에 Mock API 서버 시작
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

/**
 * 모든 테스트 후 MSW 종료
 */
afterAll(() => {
  server.close()
})

// ============================================================================
// Test Cleanup
// ============================================================================

/**
 * 각 테스트 후 정리
 */
afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  }),
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
}))

// Mock next/image - using img element for tests
vi.mock('next/image', () => ({
  default: function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
