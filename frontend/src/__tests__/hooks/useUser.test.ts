// @TASK T1.3 - useUser Hook 테스트
// @SPEC docs/planning/03-user-flow.md#프로필-설정

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUser } from '@/hooks/useUser'
import { useUser as useClerkUser } from '@clerk/nextjs'
import { useAuthStore } from '@/stores/auth'
import type { UserResource } from '@clerk/types'

// Clerk useUser Mock
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}))

// Auth Store Mock
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    syncAuth: vi.fn(),
  })),
}))

const mockUseClerkUser = vi.mocked(useClerkUser)
const mockUseAuthStore = vi.mocked(useAuthStore)

// UserResource는 많은 필드가 있으므로 테스트에 필요한 필드만 mock
const mockClerkUser = {
  id: 'user_123',
  firstName: '홍',
  lastName: '길동',
  emailAddresses: [
    {
      id: 'email_1',
      emailAddress: 'hong@example.com',
      verification: { status: 'verified' },
    } as any,
  ],
  imageUrl: 'https://example.com/avatar.jpg',
  publicMetadata: { plan: 'FREE' },
  createdAt: new Date('2024-01-01'),
} as unknown as UserResource

describe('useUser Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로딩 중일 때 isLoading이 true여야 함', () => {
    mockUseClerkUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    } as any)

    const { result } = renderHook(() => useUser())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.isSignedIn).toBe(false)
  })

  it('로그인하지 않은 경우 user가 null이어야 함', () => {
    mockUseClerkUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    })

    const { result } = renderHook(() => useUser())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBe(null)
    expect(result.current.isSignedIn).toBe(false)
    expect(result.current.isPro).toBe(false)
  })

  it('로그인한 FREE 사용자 정보를 반환해야 함', async () => {
    mockUseClerkUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
      isSignedIn: true,
    } as any)

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isSignedIn).toBe(true)
    expect(result.current.user).not.toBe(null)
    expect(result.current.user?.id).toBe('user_123')
    expect(result.current.user?.email).toBe('hong@example.com')
    expect(result.current.user?.fullName).toBe('길동홍')
    expect(result.current.user?.plan).toBe('FREE')
    expect(result.current.user?.emailVerified).toBe(true)
    expect(result.current.isPro).toBe(false)
  })

  it('로그인한 PRO 사용자는 isPro가 true여야 함', async () => {
    const proUser = {
      ...mockClerkUser,
      publicMetadata: { plan: 'PRO' },
    } as UserResource
    mockUseClerkUser.mockReturnValue({
      user: proUser,
      isLoaded: true,
      isSignedIn: true,
    } as any)

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user?.plan).toBe('PRO')
    expect(result.current.isPro).toBe(true)
  })

  it('이름이 없는 경우 fullName이 null이어야 함', async () => {
    const userWithoutName = {
      ...mockClerkUser,
      firstName: null,
      lastName: null,
    } as unknown as UserResource
    mockUseClerkUser.mockReturnValue({
      user: userWithoutName,
      isLoaded: true,
      isSignedIn: true,
    } as any)

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user?.fullName).toBe(null)
  })

  it('이메일 인증되지 않은 경우 emailVerified가 false여야 함', async () => {
    const unverifiedUser = {
      ...mockClerkUser,
      emailAddresses: [
        {
          id: 'email_1',
          emailAddress: 'hong@example.com',
          verification: { status: 'unverified' },
        } as any,
      ],
    } as unknown as UserResource
    mockUseClerkUser.mockReturnValue({
      user: unverifiedUser,
      isLoaded: true,
      isSignedIn: true,
    } as any)

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user?.emailVerified).toBe(false)
  })

  it('Auth Store와 동기화되어야 함', async () => {
    const mockSyncAuth = vi.fn()
    mockUseAuthStore.mockReturnValue({ syncAuth: mockSyncAuth })

    mockUseClerkUser.mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
      isSignedIn: true,
    } as any)

    renderHook(() => useUser())

    await waitFor(() => {
      expect(mockSyncAuth).toHaveBeenCalledWith(mockClerkUser, true, true)
    })
  })
})
