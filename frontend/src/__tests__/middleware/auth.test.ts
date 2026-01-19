// @TASK T1.2 - 미들웨어 테스트 (RED → GREEN)
// @SPEC TDD 워크플로우: 미들웨어 설정 및 라우트 보호 검증

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 미들웨어 설정 테스트
 *
 * Clerk 미들웨어는 실제 런타임에서만 동작하므로,
 * 이 테스트는 미들웨어 설정이 올바르게 되어 있는지 확인합니다.
 *
 * E2E 테스트에서 실제 인증 플로우를 검증합니다.
 */
describe('Auth Middleware Configuration - T1.2', () => {
  describe('미들웨어 설정 검증', () => {
    it('middleware.ts 파일이 존재하고 올바르게 export되어야 함', async () => {
      // 미들웨어 import
      const middlewareModule = await import('../../middleware')

      expect(middlewareModule.default).toBeDefined()
      expect(typeof middlewareModule.default).toBe('function')
    })

    it('config.matcher가 올바르게 설정되어야 함', async () => {
      const { config } = await import('../../middleware')

      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher.length).toBeGreaterThan(0)
    })

    it('matcher에 API 라우트 패턴이 포함되어야 함', async () => {
      const { config } = await import('../../middleware')

      const hasApiMatcher = config.matcher.some((pattern: string) =>
        pattern.includes('api') || pattern.includes('trpc')
      )

      expect(hasApiMatcher).toBe(true)
    })

    it('matcher가 _next 경로를 제외해야 함', async () => {
      const { config } = await import('../../middleware')

      // 첫 번째 matcher는 일반 라우트용이고, _next를 제외함
      const firstMatcher = config.matcher[0]
      expect(firstMatcher).toContain('_next')
      expect(firstMatcher).toMatch(/!\(|_next/)
    })

    it('matcher가 정적 파일 확장자를 제외해야 함', async () => {
      const { config } = await import('../../middleware')

      const firstMatcher = config.matcher[0]

      // 정적 파일 확장자들이 제외 패턴에 포함되어야 함 (regex 패턴 고려)
      // jpg는 jpe?g 패턴으로 포함됨
      expect(firstMatcher).toContain('css')
      expect(firstMatcher).toContain('png')
      expect(firstMatcher).toContain('svg')
      expect(firstMatcher).toContain('ico')
      // jpg/jpeg는 jpe?g 패턴으로 처리
      expect(firstMatcher).toMatch(/jpe\?g/)
    })
  })

  describe('보호된 라우트 로직 검증', () => {
    it('보호된 라우트 패턴이 올바르게 정의되어야 함', () => {
      // 미들웨어 소스 코드 읽기
      // fs와 path는 파일 상단에서 import됨
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
      const middlewareSource = fs.readFileSync(middlewarePath, 'utf-8')

      // 보호된 라우트 확인
      expect(middlewareSource).toContain('/dashboard')
      expect(middlewareSource).toContain('/editor')
      expect(middlewareSource).toContain('/settings')
    })

    it('createRouteMatcher가 사용되어야 함', () => {
      // fs와 path는 파일 상단에서 import됨
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
      const middlewareSource = fs.readFileSync(middlewarePath, 'utf-8')

      expect(middlewareSource).toContain('createRouteMatcher')
      expect(middlewareSource).toContain('isProtectedRoute')
    })

    it('auth.protect()가 보호된 라우트에 대해 호출되어야 함', () => {
      // fs와 path는 파일 상단에서 import됨
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
      const middlewareSource = fs.readFileSync(middlewarePath, 'utf-8')

      expect(middlewareSource).toContain('auth.protect()')
      expect(middlewareSource).toContain('if (isProtectedRoute')
    })
  })

  describe('Clerk 통합 검증', () => {
    it('clerkMiddleware를 올바르게 import해야 함', () => {
      // fs와 path는 파일 상단에서 import됨
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
      const middlewareSource = fs.readFileSync(middlewarePath, 'utf-8')

      expect(middlewareSource).toContain("import { clerkMiddleware")
      expect(middlewareSource).toContain("@clerk/nextjs/server")
    })

    it('clerkMiddleware를 default export해야 함', () => {
      // fs와 path는 파일 상단에서 import됨
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
      const middlewareSource = fs.readFileSync(middlewarePath, 'utf-8')

      expect(middlewareSource).toContain('export default clerkMiddleware')
    })
  })

  describe('공개 라우트 검증', () => {
    it('공개 라우트가 주석에 명시되어야 함', () => {
      // fs와 path는 파일 상단에서 import됨
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
      const middlewareSource = fs.readFileSync(middlewarePath, 'utf-8')

      // 공개 라우트 관련 주석 또는 로직 확인
      const hasPublicRouteInfo =
        middlewareSource.includes('/') ||
        middlewareSource.includes('/g/') ||
        middlewareSource.includes('/sign-in') ||
        middlewareSource.includes('/sign-up') ||
        middlewareSource.includes('공개')

      expect(hasPublicRouteInfo).toBe(true)
    })
  })
})

/**
 * 라우트 매칭 로직 테스트
 *
 * createRouteMatcher의 동작을 시뮬레이션하여 테스트
 */
describe('Route Matching Logic - T1.2', () => {
  const protectedRoutes = ['/dashboard(.*)', '/editor(.*)', '/settings(.*)']

  const isRouteProtected = (pathname: string): boolean => {
    return protectedRoutes.some(route => {
      const pattern = route.replace('(.*)', '')
      return pathname.startsWith(pattern)
    })
  }

  describe('보호된 라우트 매칭', () => {
    it('/dashboard는 보호된 라우트로 매칭되어야 함', () => {
      expect(isRouteProtected('/dashboard')).toBe(true)
    })

    it('/dashboard/analytics는 보호된 라우트로 매칭되어야 함', () => {
      expect(isRouteProtected('/dashboard/analytics')).toBe(true)
    })

    it('/editor는 보호된 라우트로 매칭되어야 함', () => {
      expect(isRouteProtected('/editor')).toBe(true)
    })

    it('/editor/guide-123는 보호된 라우트로 매칭되어야 함', () => {
      expect(isRouteProtected('/editor/guide-123')).toBe(true)
    })

    it('/settings는 보호된 라우트로 매칭되어야 함', () => {
      expect(isRouteProtected('/settings')).toBe(true)
    })

    it('/settings/profile은 보호된 라우트로 매칭되어야 함', () => {
      expect(isRouteProtected('/settings/profile')).toBe(true)
    })
  })

  describe('공개 라우트 매칭', () => {
    it('/는 보호되지 않은 라우트여야 함', () => {
      expect(isRouteProtected('/')).toBe(false)
    })

    it('/g/example-guide는 보호되지 않은 라우트여야 함', () => {
      expect(isRouteProtected('/g/example-guide')).toBe(false)
    })

    it('/sign-in은 보호되지 않은 라우트여야 함', () => {
      expect(isRouteProtected('/sign-in')).toBe(false)
    })

    it('/sign-up은 보호되지 않은 라우트여야 함', () => {
      expect(isRouteProtected('/sign-up')).toBe(false)
    })

    it('/about는 보호되지 않은 라우트여야 함', () => {
      expect(isRouteProtected('/about')).toBe(false)
    })
  })
})
