// @TASK T6.1 - E2E 테스트 픽스처
// @SPEC docs/planning/02-trd.md#테스트-피라미드

import { test as base, Page } from '@playwright/test';

/**
 * 테스트 픽스처 타입
 */
type TestFixtures = {
  authenticatedPage: Page;
};

/**
 * 인증된 사용자 페이지 픽스처
 *
 * Clerk 인증을 시뮬레이션하기 위해 localStorage에 인증 정보를 설정합니다.
 * 실제 E2E 테스트에서는 Clerk의 테스트 토큰을 사용하는 것이 이상적이지만,
 * 여기서는 간단한 mock 방식을 사용합니다.
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // 로그인 페이지로 이동
    await page.goto('/');

    // Clerk 세션 정보를 localStorage에 설정 (mock)
    // 실제 환경에서는 Clerk의 signIn() 또는 테스트 토큰 사용
    await page.evaluate(() => {
      // Mock user data
      const mockUser = {
        id: 'user_test123',
        firstName: 'Test',
        lastName: 'User',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      };

      // Mock session (Clerk 형식 시뮬레이션)
      const mockSession = {
        id: 'sess_test123',
        userId: 'user_test123',
        status: 'active',
        lastActiveAt: new Date().toISOString(),
      };

      // localStorage에 저장 (실제 Clerk는 다른 방식 사용)
      localStorage.setItem('__clerk_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('__clerk_mock_session', JSON.stringify(mockSession));
    });

    // 픽스처 사용
    await use(page);

    // 테스트 후 정리
    await page.evaluate(() => {
      localStorage.removeItem('__clerk_mock_user');
      localStorage.removeItem('__clerk_mock_session');
    });
  },
});

/**
 * E2E 테스트용 헬퍼 함수
 */
export class TestHelpers {
  /**
   * 특정 시간만큼 대기
   */
  static async wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 네트워크 요청 대기
   */
  static async waitForRequest(page: Page, urlPattern: string | RegExp) {
    return page.waitForRequest(urlPattern);
  }

  /**
   * 네트워크 응답 대기
   */
  static async waitForResponse(page: Page, urlPattern: string | RegExp) {
    return page.waitForResponse(urlPattern);
  }

  /**
   * API 응답 모킹
   */
  static async mockApiResponse(
    page: Page,
    url: string,
    response: any,
    status = 200
  ) {
    await page.route(url, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * 로딩 상태가 사라질 때까지 대기
   */
  static async waitForLoadingToFinish(page: Page) {
    await page.waitForSelector('[data-testid*="loading"]', { state: 'hidden' });
  }

  /**
   * Toast 메시지 확인
   */
  static async expectToast(page: Page, message: string) {
    const toast = page.locator('[role="alert"]', { hasText: message });
    await toast.waitFor({ state: 'visible', timeout: 5000 });
  }
}

/**
 * Mock 데이터
 */
export const mockData = {
  guide: {
    id: 'guide-123',
    userId: 'user_test123',
    title: '테스트 안내서',
    slug: 'test-guide',
    description: '테스트용 안내서입니다.',
    coverImage: null,
    isPublished: true,
    theme: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Pretendard',
      borderRadius: 'md',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  guideWithBlocks: {
    id: 'guide-123',
    userId: 'user_test123',
    title: '테스트 안내서',
    slug: 'test-guide',
    description: '테스트용 안내서입니다.',
    coverImage: null,
    isPublished: true,
    theme: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Pretendard',
      borderRadius: 'md',
    },
    blocks: [
      {
        id: 'block-1',
        guideId: 'guide-123',
        type: 'text',
        content: { text: '환영합니다!' },
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'block-2',
        guideId: 'guide-123',
        type: 'heading',
        content: { text: '시작하기', level: 2 },
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'block-3',
        guideId: 'guide-123',
        type: 'code',
        content: {
          code: 'npm install roomy',
          language: 'bash',
        },
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  guideList: [
    {
      id: 'guide-1',
      title: '첫 번째 안내서',
      slug: 'first-guide',
      coverImage: null,
      isPublished: true,
      blockCount: 5,
      viewCount: 42,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'guide-2',
      title: '두 번째 안내서',
      slug: null,
      coverImage: null,
      isPublished: false,
      blockCount: 3,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  createGuideResponse: {
    success: true,
    data: {
      id: 'guide-new',
      userId: 'user_test123',
      title: '새 안내서',
      slug: null,
      description: null,
      coverImage: null,
      isPublished: false,
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Pretendard',
        borderRadius: 'md',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },

  publishGuideResponse: {
    success: true,
    data: {
      id: 'guide-123',
      slug: 'my-awesome-guide',
      isPublished: true,
    },
  },
};

export { expect } from '@playwright/test';
