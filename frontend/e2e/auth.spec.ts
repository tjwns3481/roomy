// @TASK T6.1 - 인증 플로우 E2E 테스트
// @SPEC docs/planning/03-user-flow.md#인증-플로우

import { test, expect } from '@playwright/test';

/**
 * 인증 플로우 테스트
 *
 * 주의: Clerk 인증은 실제 환경에서 테스트하기 어렵므로
 * 여기서는 리다이렉트와 페이지 접근성에 초점을 맞춥니다.
 */
test.describe('Authentication Flow', () => {
  test.describe('Public Routes', () => {
    test('should show landing page on root path', async ({ page }) => {
      // Given: 사용자가 홈페이지에 접근
      await page.goto('/');

      // Then: 랜딩 페이지가 표시됨
      await expect(page).toHaveTitle(/Roomy/);

      // 랜딩 페이지 주요 요소 확인
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });

    test('should access guest page without authentication', async ({ page }) => {
      // Given: 발행된 안내서의 게스트 페이지 URL
      const slug = 'test-guide';

      // API 응답 모킹
      await page.route('**/api/guides/by-slug/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'guide-123',
              title: '테스트 안내서',
              slug: slug,
              description: '공개된 안내서',
              isPublished: true,
              blocks: [
                {
                  id: 'block-1',
                  type: 'text',
                  content: { text: '환영합니다!' },
                  order: 0,
                },
              ],
              theme: {
                primaryColor: '#3B82F6',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Pretendard',
                borderRadius: 'md',
              },
            },
          }),
        });
      });

      // When: 게스트 페이지에 접근
      await page.goto(`/g/${slug}`);

      // Then: 인증 없이 페이지가 표시됨
      await expect(page.locator('h1')).toContainText('테스트 안내서');
    });
  });

  test.describe('Protected Routes - Redirect', () => {
    test('should redirect to sign-in when accessing dashboard without auth', async ({
      page,
    }) => {
      // Given: 인증되지 않은 사용자

      // When: 보호된 경로(/dashboard)에 접근 시도
      await page.goto('/dashboard');

      // Then: Clerk 로그인 페이지로 리다이렉트
      // Clerk는 자체 sign-in 페이지로 리다이렉트하거나
      // Next.js의 로그인 페이지로 리다이렉트합니다.
      await page.waitForURL(/sign-in|login/i, { timeout: 10000 });

      // URL에 sign-in 또는 login이 포함되어 있는지 확인
      expect(page.url()).toMatch(/sign-in|login/i);
    });

    test('should redirect to sign-in when accessing editor without auth', async ({
      page,
    }) => {
      // Given: 인증되지 않은 사용자

      // When: 에디터 페이지에 접근 시도
      await page.goto('/editor/some-guide-id');

      // Then: 로그인 페이지로 리다이렉트
      await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
      expect(page.url()).toMatch(/sign-in|login/i);
    });

    test('should redirect to sign-in when accessing settings without auth', async ({
      page,
    }) => {
      // Given: 인증되지 않은 사용자

      // When: 설정 페이지에 접근 시도
      await page.goto('/settings');

      // Then: 로그인 페이지로 리다이렉트
      await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
      expect(page.url()).toMatch(/sign-in|login/i);
    });
  });

  test.describe('Clerk Sign In Page', () => {
    test.skip('should display Clerk sign-in form', async ({ page }) => {
      // 이 테스트는 실제 Clerk 환경이 필요하므로 skip 처리
      // 실제 환경에서는 Clerk의 테스트 키를 사용하여 테스트 가능

      await page.goto('/sign-in');

      // Clerk 로그인 폼이 로드되었는지 확인
      // Clerk 컴포넌트는 iframe 또는 Web Component로 렌더링될 수 있음
      const signInForm = page.locator('[data-clerk-id]').first();
      await expect(signInForm).toBeVisible({ timeout: 10000 });
    });

    test.skip('should sign in with email and password', async ({ page }) => {
      // 실제 Clerk 인증 테스트
      // Clerk 테스트 계정 필요
      await page.goto('/sign-in');

      // 이메일 입력
      await page.fill('input[name="identifier"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // 비밀번호 입력
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      // 로그인 후 대시보드로 리다이렉트
      await page.waitForURL('/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Session Persistence', () => {
    test.skip('should maintain session after page refresh', async ({ page }) => {
      // 실제 Clerk 세션 테스트
      // 로그인 후 페이지 새로고침 시 세션 유지 확인

      // 1. 로그인
      await page.goto('/sign-in');
      // ... 로그인 프로세스

      // 2. 대시보드 확인
      await page.waitForURL('/dashboard');

      // 3. 페이지 새로고침
      await page.reload();

      // 4. 여전히 대시보드에 있는지 확인 (로그인 유지)
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('h1')).toContainText('내 안내서');
    });

    test.skip('should redirect to sign-in after sign-out', async ({ page }) => {
      // 로그아웃 테스트

      // 1. 로그인된 상태에서 시작
      await page.goto('/dashboard');

      // 2. 로그아웃 버튼 클릭
      await page.click('button:has-text("로그아웃")');

      // 3. 로그인 페이지로 리다이렉트
      await page.waitForURL(/sign-in|login/i);
      expect(page.url()).toMatch(/sign-in|login/i);

      // 4. 보호된 페이지 접근 시도
      await page.goto('/dashboard');

      // 5. 다시 로그인 페이지로 리다이렉트
      await page.waitForURL(/sign-in|login/i);
    });
  });

  test.describe('Middleware Protection', () => {
    test('should protect all /dashboard routes', async ({ page }) => {
      const protectedRoutes = [
        '/dashboard',
        '/dashboard/settings',
        '/dashboard/guides',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // 로그인 페이지로 리다이렉트되는지 확인
        await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
        expect(page.url()).toMatch(/sign-in|login/i);
      }
    });

    test('should protect all /editor routes', async ({ page }) => {
      const protectedRoutes = [
        '/editor/test-id-1',
        '/editor/test-id-2',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
        expect(page.url()).toMatch(/sign-in|login/i);
      }
    });
  });
});

/**
 * 인증 헬퍼 함수 (실제 Clerk 테스트에서 사용 가능)
 */
export async function signIn(
  page: any,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/sign-in');

  // 이메일 입력
  await page.fill('input[name="identifier"]', email);
  await page.click('button[type="submit"]');

  // 비밀번호 입력
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // 로그인 완료 대기
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

export async function signOut(page: any): Promise<void> {
  // 사용자 메뉴 열기
  await page.click('[data-testid="user-menu-trigger"]');

  // 로그아웃 버튼 클릭
  await page.click('button:has-text("로그아웃")');

  // 로그인 페이지로 리다이렉트 대기
  await page.waitForURL(/sign-in|login/i, { timeout: 10000 });
}
