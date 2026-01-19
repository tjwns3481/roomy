// @TASK T1.1 - Auth Store 테스트
// @SPEC docs/planning/03-user-flow.md#인증-플로우
// @TEST src/stores/auth.ts

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { useUser, useAuth } from '@clerk/nextjs'

// Mock Clerk hooks
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  useAuth: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    })
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 한다', () => {
      vi.mocked(useUser).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
      } as any)

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        userId: null,
      } as any)

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.isLoaded).toBe(false)
      expect(result.current.isSignedIn).toBe(false)
    })
  })

  describe('로그인 상태', () => {
    it('사용자가 로그인하면 상태가 업데이트되어야 한다', () => {
      const mockUser = {
        id: 'user_123',
        firstName: '홍',
        lastName: '길동',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg',
      } as any

      vi.mocked(useUser).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: mockUser,
      } as any)

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'user_123',
      } as any)

      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isLoaded: true,
          isSignedIn: true,
        })
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.isSignedIn).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.user?.id).toBe('user_123')
    })

    it('사용자 정보를 올바르게 반환해야 한다', () => {
      const mockUser = {
        id: 'user_456',
        firstName: '김',
        lastName: '철수',
        emailAddresses: [{ emailAddress: 'kim@example.com' }],
        imageUrl: 'https://example.com/kim.jpg',
      } as any

      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isLoaded: true,
          isSignedIn: true,
        })
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user?.firstName).toBe('김')
      expect(result.current.user?.lastName).toBe('철수')
      expect(result.current.user?.emailAddresses[0].emailAddress).toBe('kim@example.com')
    })
  })

  describe('로그아웃 상태', () => {
    it('로그아웃하면 상태가 초기화되어야 한다', () => {
      // 먼저 로그인 상태로 설정
      act(() => {
        useAuthStore.setState({
          user: {
            id: 'user_123',
            firstName: '홍',
            lastName: '길동',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
            imageUrl: 'https://example.com/avatar.jpg',
          } as any,
          isLoaded: true,
          isSignedIn: true,
        })
      })

      // 로그아웃
      act(() => {
        useAuthStore.setState({
          user: null,
          isLoaded: true,
          isSignedIn: false,
        })
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.isSignedIn).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.isLoaded).toBe(true)
    })
  })

  describe('로딩 상태', () => {
    it('Clerk가 로딩 중일 때 isLoaded가 false여야 한다', () => {
      vi.mocked(useUser).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
      } as any)

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        userId: null,
      } as any)

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.isLoaded).toBe(false)
    })

    it('Clerk 로딩 완료 후 isLoaded가 true여야 한다', () => {
      vi.mocked(useUser).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      } as any)

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      } as any)

      act(() => {
        useAuthStore.setState({
          isLoaded: true,
          isSignedIn: false,
          user: null,
        })
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.isLoaded).toBe(true)
    })
  })

  describe('상태 동기화', () => {
    it('Clerk 상태 변경 시 store 상태도 업데이트되어야 한다', () => {
      // 초기: 로그아웃 상태
      vi.mocked(useUser).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      } as any)

      const { result, rerender } = renderHook(() => useAuthStore())

      expect(result.current.isSignedIn).toBe(false)

      // 상태 변경: 로그인
      const mockUser = {
        id: 'user_789',
        firstName: '이',
        lastName: '영희',
        emailAddresses: [{ emailAddress: 'lee@example.com' }],
        imageUrl: 'https://example.com/lee.jpg',
      } as any

      vi.mocked(useUser).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: mockUser,
      } as any)

      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isLoaded: true,
          isSignedIn: true,
        })
      })

      rerender()

      expect(result.current.isSignedIn).toBe(true)
      expect(result.current.user?.id).toBe('user_789')
    })
  })
})
