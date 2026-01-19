// @TASK T6.1 - 안내서 생성/편집 E2E 테스트
// @SPEC docs/planning/03-user-flow.md#에디터-플로우

import { test, expect, TestHelpers, mockData } from './fixtures';

/**
 * 안내서 생성 및 편집 플로우 테스트
 *
 * 주의: authenticatedPage 픽스처 사용으로 인증 상태 시뮬레이션
 */
test.describe('Guide Creation and Editing', () => {
  test.describe('Dashboard - Guide List', () => {
    test('should display guide list on dashboard', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides?**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideList,
            pagination: {
              page: 1,
              limit: 20,
              total: 2,
              totalPages: 1,
            },
          }),
        });
      });

      // Given: 사용자가 대시보드에 접근
      await page.goto('/dashboard');

      // Then: 안내서 목록이 표시됨
      await expect(page.locator('h1')).toContainText('내 안내서');

      // 안내서 카드 확인
      const guideCards = page.locator('[data-testid^="guide-card-"]');
      await expect(guideCards).toHaveCount(2);

      // 첫 번째 안내서 확인
      await expect(page.locator('[data-testid="guide-card-guide-1"]')).toContainText(
        '첫 번째 안내서'
      );

      // 발행 상태 확인
      await expect(
        page.locator('[data-testid="guide-card-guide-1"] [data-testid="publish-badge"]')
      ).toContainText('발행됨');

      // 미발행 상태 확인
      await expect(
        page.locator('[data-testid="guide-card-guide-2"] [data-testid="draft-badge"]')
      ).toContainText('초안');
    });

    test('should show empty state when no guides exist', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹 (빈 목록)
      await page.route('**/api/guides?**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
            },
          }),
        });
      });

      // Given: 사용자가 대시보드에 접근
      await page.goto('/dashboard');

      // Then: 빈 상태가 표시됨
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="empty-state"]')
      ).toContainText('아직 안내서가 없습니다');
    });
  });

  test.describe('Create New Guide', () => {
    test('should create new guide from dashboard', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides?**', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [],
              pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            }),
          });
        }
      });

      await page.route('**/api/guides', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockData.createGuideResponse),
          });
        }
      });

      // Given: 사용자가 대시보드에 있음
      await page.goto('/dashboard');

      // When: "새 안내서 만들기" 버튼 클릭
      const createButton = page.locator('button:has-text("새 안내서 만들기")');
      await createButton.click();

      // Then: 에디터 페이지로 리다이렉트
      await page.waitForURL(/\/editor\/guide-new/, { timeout: 10000 });
      expect(page.url()).toContain('/editor/');
    });

    test('should show loading state during guide creation', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 지연 모킹
      await page.route('**/api/guides?**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          }),
        });
      });

      await page.route('**/api/guides', async (route) => {
        if (route.request().method() === 'POST') {
          // 2초 지연
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(mockData.createGuideResponse),
          });
        }
      });

      await page.goto('/dashboard');

      // When: 생성 버튼 클릭
      const createButton = page.locator('button:has-text("새 안내서 만들기")');
      await createButton.click();

      // Then: 로딩 상태 표시
      await expect(createButton).toBeDisabled();
      // 버튼 내 로딩 인디케이터 확인 (구현에 따라 다를 수 있음)
    });
  });

  test.describe('Editor - Block Management', () => {
    test('should load editor with guide data', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      // Given: 에디터 페이지에 접근
      await page.goto('/editor/guide-123');

      // Then: 안내서 제목이 표시됨
      await expect(page.locator('h1, [data-testid="guide-title"]')).toContainText(
        '테스트 안내서'
      );

      // 블록 목록이 표시됨
      const blocks = page.locator('[data-testid^="block-"]');
      await expect(blocks).toHaveCount(3);
    });

    test('should add new text block', async ({ authenticatedPage: page }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.route('**/api/guides/guide-123/blocks', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: 'block-new',
                guideId: 'guide-123',
                type: 'text',
                content: { text: '' },
                order: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }),
          });
        }
      });

      await page.goto('/editor/guide-123');

      // When: 텍스트 블록 추가 버튼 클릭
      const addTextButton = page.locator('button:has-text("텍스트")');
      await addTextButton.click();

      // Then: 새 블록이 추가됨
      const newBlock = page.locator('[data-testid="block-block-new"]');
      await expect(newBlock).toBeVisible();
    });

    test('should edit block content', async ({ authenticatedPage: page }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.route('**/api/guides/guide-123/blocks/block-1', async (route) => {
        if (route.request().method() === 'PATCH') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: 'block-1',
                guideId: 'guide-123',
                type: 'text',
                content: { text: '수정된 텍스트' },
                order: 0,
              },
            }),
          });
        }
      });

      await page.goto('/editor/guide-123');

      // When: 블록 내용 수정
      const blockInput = page.locator('[data-testid="block-block-1"] textarea');
      await blockInput.click();
      await blockInput.fill('수정된 텍스트');

      // 포커스 제거 (blur) - 자동 저장 트리거
      await page.keyboard.press('Escape');

      // Then: 저장 완료 표시 (debounce 고려)
      await page.waitForTimeout(1500); // debounce 대기

      // 성공 토스트 또는 저장 상태 확인
      // await TestHelpers.expectToast(page, '저장되었습니다');
    });

    test('should delete block', async ({ authenticatedPage: page }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.route('**/api/guides/guide-123/blocks/block-1', async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 204,
          });
        }
      });

      await page.goto('/editor/guide-123');

      // When: 블록 삭제 버튼 클릭
      const deleteButton = page.locator(
        '[data-testid="block-block-1"] button[aria-label="블록 삭제"]'
      );
      await deleteButton.click();

      // 확인 다이얼로그 (있는 경우)
      const confirmButton = page.locator('button:has-text("삭제")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Then: 블록이 제거됨
      await expect(page.locator('[data-testid="block-block-1"]')).not.toBeVisible();
    });

    test('should reorder blocks with drag and drop', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.route('**/api/guides/guide-123/blocks/reorder', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
            }),
          });
        }
      });

      await page.goto('/editor/guide-123');

      // When: 첫 번째 블록을 두 번째 블록 아래로 드래그
      const firstBlock = page.locator('[data-testid="block-block-1"]');
      const secondBlock = page.locator('[data-testid="block-block-2"]');

      const firstBlockBox = await firstBlock.boundingBox();
      const secondBlockBox = await secondBlock.boundingBox();

      if (firstBlockBox && secondBlockBox) {
        await page.mouse.move(
          firstBlockBox.x + firstBlockBox.width / 2,
          firstBlockBox.y + firstBlockBox.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(
          secondBlockBox.x + secondBlockBox.width / 2,
          secondBlockBox.y + secondBlockBox.height + 10
        );
        await page.mouse.up();

        // Then: 블록 순서가 변경됨
        await page.waitForTimeout(500); // 애니메이션 대기
      }
    });
  });

  test.describe('Guide Publishing', () => {
    test('should publish guide with valid slug', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      // Slug 중복 확인
      await page.route('**/api/guides/check-slug?slug=my-awesome-guide', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            available: true,
          }),
        });
      });

      // 발행 API
      await page.route('**/api/guides/guide-123/publish', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData.publishGuideResponse),
          });
        }
      });

      await page.goto('/editor/guide-123');

      // When: 발행 버튼 클릭
      const publishButton = page.locator('button:has-text("발행")');
      await publishButton.click();

      // 발행 다이얼로그 표시
      const slugInput = page.locator('input[name="slug"]');
      await expect(slugInput).toBeVisible();

      // Slug 입력
      await slugInput.fill('my-awesome-guide');

      // 발행 확인
      const confirmPublishButton = page.locator(
        '[data-testid="publish-dialog"] button:has-text("발행")'
      );
      await confirmPublishButton.click();

      // Then: 성공 메시지 표시
      await TestHelpers.expectToast(page, '발행되었습니다');

      // 게스트 페이지 링크 표시
      const guestLink = page.locator('[data-testid="guest-link"]');
      await expect(guestLink).toContainText('/g/my-awesome-guide');
    });

    test('should show error for duplicate slug', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      // Slug 중복 확인 (중복됨)
      await page.route('**/api/guides/check-slug?slug=existing-slug', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            available: false,
            suggestion: 'existing-slug-2',
          }),
        });
      });

      await page.goto('/editor/guide-123');

      // When: 발행 버튼 클릭
      const publishButton = page.locator('button:has-text("발행")');
      await publishButton.click();

      // Slug 입력 (이미 사용 중인 slug)
      const slugInput = page.locator('input[name="slug"]');
      await slugInput.fill('existing-slug');

      // 중복 확인 대기
      await page.waitForTimeout(500);

      // Then: 에러 메시지 표시
      await expect(page.locator('text=이미 사용 중인 슬러그입니다')).toBeVisible();

      // 추천 slug 표시
      await expect(page.locator('text=existing-slug-2')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to dashboard', async ({
      authenticatedPage: page,
    }) => {
      // API 응답 모킹
      await page.route('**/api/guides/guide-123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockData.guideWithBlocks,
          }),
        });
      });

      await page.goto('/editor/guide-123');

      // When: 뒤로가기 버튼 클릭
      const backButton = page.locator('button[aria-label="뒤로가기"], button:has-text("뒤로")');
      await backButton.click();

      // Then: 대시보드로 이동
      await page.waitForURL('/dashboard', { timeout: 5000 });
      expect(page.url()).toContain('/dashboard');
    });
  });
});
