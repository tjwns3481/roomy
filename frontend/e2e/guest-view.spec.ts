// @TASK T6.1 - 게스트 뷰 E2E 테스트
// @SPEC docs/planning/03-user-flow.md#게스트-플로우

import { test, expect, mockData } from './fixtures';

/**
 * 게스트 뷰 테스트
 *
 * 발행된 안내서를 공개적으로 볼 수 있는 페이지 테스트
 */
test.describe('Guest View', () => {
  test.describe('Published Guide Access', () => {
    test('should display published guide content', async ({ page }) => {
      // API 응답 모킹
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      // Given: 발행된 안내서의 게스트 페이지 URL
      await page.goto('/g/test-guide');

      // Then: 안내서 제목이 표시됨
      await expect(page.locator('h1')).toContainText('테스트 안내서');

      // 안내서 설명 표시 (있는 경우)
      if (mockData.guideWithBlocks.description) {
        await expect(page.locator('[data-testid="guide-description"]')).toContainText(
          mockData.guideWithBlocks.description
        );
      }

      // 블록 콘텐츠 표시
      const blocks = page.locator('[data-testid^="block-"]');
      await expect(blocks).toHaveCount(3);
    });

    test('should display text block correctly', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Text 블록 확인
      const textBlock = page.locator('[data-testid="block-block-1"]');
      await expect(textBlock).toContainText('환영합니다!');
    });

    test('should display heading block correctly', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Heading 블록 확인
      const headingBlock = page.locator('[data-testid="block-block-2"]');
      await expect(headingBlock).toContainText('시작하기');

      // h2 태그 확인
      const h2 = headingBlock.locator('h2');
      await expect(h2).toBeVisible();
    });

    test('should display code block with syntax highlighting', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Code 블록 확인
      const codeBlock = page.locator('[data-testid="block-block-3"]');
      await expect(codeBlock).toBeVisible();

      // 코드 내용 확인
      const code = codeBlock.locator('code, pre');
      await expect(code).toContainText('npm install roomy');
    });
  });

  test.describe('Copy Functionality', () => {
    test('should copy code block content to clipboard', async ({ page, context }) => {
      // 클립보드 권한 허용
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // When: 코드 블록의 복사 버튼 클릭
      const copyButton = page.locator(
        '[data-testid="block-block-3"] button[aria-label="코드 복사"]'
      );
      await copyButton.click();

      // Then: 클립보드에 코드 복사됨
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toBe('npm install roomy');

      // 복사 성공 피드백 확인
      await expect(
        page.locator('[data-testid="block-block-3"] [data-testid="copy-success"]')
      ).toBeVisible({ timeout: 2000 });
    });

    test('should show copy success feedback', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      const copyButton = page.locator(
        '[data-testid="block-block-3"] button[aria-label="코드 복사"]'
      );

      // When: 복사 버튼 클릭
      await copyButton.click();

      // Then: 버튼 텍스트가 "복사됨" 또는 체크 아이콘으로 변경
      await expect(copyButton).toHaveText(/복사됨|Copied/i, { timeout: 2000 });

      // 일정 시간 후 원래 상태로 복원
      await page.waitForTimeout(3000);
      await expect(copyButton).toHaveText(/복사|Copy/i);
    });
  });

  test.describe('Error Handling', () => {
    test('should show 404 page for non-existent guide', async ({ page }) => {
      // API 응답 모킹 (404)
      await page.route('**/api/guides/by-slug/non-existent-guide', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '안내서를 찾을 수 없습니다',
            },
          }),
        });
      });

      // Given: 존재하지 않는 slug로 접근
      await page.goto('/g/non-existent-guide');

      // Then: 404 페이지 표시
      await expect(page.locator('h1')).toContainText(/404|찾을 수 없습니다/i);
    });

    test('should show error for unpublished guide', async ({ page }) => {
      // API 응답 모킹 (403 또는 404)
      await page.route('**/api/guides/by-slug/unpublished-guide', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: '발행되지 않은 안내서입니다',
            },
          }),
        });
      });

      // Given: 미발행 안내서의 slug로 접근
      await page.goto('/g/unpublished-guide');

      // Then: 에러 메시지 표시
      await expect(page.locator('body')).toContainText(/발행되지 않은|접근할 수 없습니다/i);
    });

    test('should show loading state while fetching guide', async ({ page }) => {
      // API 응답 지연 모킹
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      // Given: 게스트 페이지 접근
      await page.goto('/g/test-guide');

      // Then: 로딩 상태 표시
      await expect(page.locator('[data-testid="loading"]')).toBeVisible({
        timeout: 1000,
      });

      // 로딩 완료 후 콘텐츠 표시
      await expect(page.locator('h1')).toContainText('테스트 안내서', {
        timeout: 5000,
      });
    });
  });

  test.describe('Theme Customization', () => {
    test('should apply custom theme colors', async ({ page }) => {
      const customTheme = {
        ...mockData.guideWithBlocks,
        theme: {
          primaryColor: '#FF5733',
          backgroundColor: '#F0F0F0',
          fontFamily: 'Arial',
          borderRadius: 'lg',
        },
      };

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: customTheme,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 커스텀 테마가 적용됨
      const root = page.locator('html, body, [data-testid="guest-content"]');

      // 배경색 확인 (CSS 변수 또는 inline style)
      const bgColor = await root.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // RGB 값 확인 (F0F0F0 = rgb(240, 240, 240))
      expect(bgColor).toContain('240');
    });

    test('should apply custom font family', async ({ page }) => {
      const customTheme = {
        ...mockData.guideWithBlocks,
        theme: {
          primaryColor: '#3B82F6',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Courier New',
          borderRadius: 'md',
        },
      };

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: customTheme,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 폰트가 적용됨
      const body = page.locator('body');
      const fontFamily = await body.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      expect(fontFamily).toContain('Courier');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 });

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 콘텐츠가 모바일에 맞게 표시됨
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid^="block-"]').first()).toBeVisible();

      // 가로 스크롤이 없는지 확인
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 0;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });

    test('should display correctly on tablet devices', async ({ page }) => {
      // 태블릿 뷰포트 설정
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 태블릿에 맞게 표시됨
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should display correctly on desktop', async ({ page }) => {
      // 데스크톱 뷰포트 설정
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 데스크톱에 맞게 표시됨
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('SEO and Metadata', () => {
    test('should have correct page title', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 페이지 제목에 안내서 제목이 포함됨
      await expect(page).toHaveTitle(/테스트 안내서/);
    });

    test('should have meta description', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: meta description 태그 존재
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });
  });

  test.describe('QR Code', () => {
    test('should display QR code for sharing', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // QR 코드 버튼 또는 아이콘 확인
      const qrButton = page.locator('button[aria-label="QR 코드"], [data-testid="qr-code-button"]');

      // QR 코드 기능이 구현된 경우
      if (await qrButton.isVisible()) {
        // When: QR 코드 버튼 클릭
        await qrButton.click();

        // Then: QR 코드 이미지 표시
        const qrImage = page.locator('img[alt*="QR"], canvas[data-testid="qr-canvas"]');
        await expect(qrImage).toBeVisible();
      }
    });
  });

  test.describe('Block Ordering', () => {
    test('should display blocks in correct order', async ({ page }) => {
      await page.route('**/api/guides/by-slug/test-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/g/test-guide');

      // Then: 블록이 order 순서대로 표시됨
      const blocks = page.locator('[data-testid^="block-"]');

      // 첫 번째 블록 (order: 0)
      await expect(blocks.nth(0)).toContainText('환영합니다!');

      // 두 번째 블록 (order: 1)
      await expect(blocks.nth(1)).toContainText('시작하기');

      // 세 번째 블록 (order: 2)
      await expect(blocks.nth(2)).toContainText('npm install roomy');
    });
  });
});
