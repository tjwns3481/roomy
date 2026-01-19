// @TEST T0.5.2 - MSW Mock 안내서 API 테스트
// @SPEC frontend/src/mocks/handlers/guides.ts

import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:3000/api';

describe('MSW Guide Handlers', () => {

  /**
   * @TEST T0.5.2.26 - POST /api/guides 테스트
   */
  describe('POST /api/guides', () => {
    it('should create a new guide', async () => {
      const response = await fetch(`${API_BASE}/guides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '새로운 안내서',
          description: '테스트용 안내서',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
      expect(data.data.title).toBe('새로운 안내서');
      expect(data.data.description).toBe('테스트용 안내서');
      expect(data.data.isPublished).toBe(false);
    });

    it('should reject request without title', async () => {
      const response = await fetch(`${API_BASE}/guides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '설명만 있음',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  /**
   * @TEST T0.5.2.27 - GET /api/guides 테스트
   */
  describe('GET /api/guides', () => {
    it('should return paginated guide list', async () => {
      const response = await fetch(`${API_BASE}/guides?page=1&limit=10`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
    });

    it('should filter by published status', async () => {
      const response = await fetch(`${API_BASE}/guides?isPublished=true`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
      data.data.forEach((item: any) => {
        expect(item.isPublished).toBe(true);
      });
    });

    it('should search by title', async () => {
      const response = await fetch(`${API_BASE}/guides?search=가이드`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  /**
   * @TEST T0.5.2.28 - GET /api/guides/:id 테스트
   */
  describe('GET /api/guides/:id', () => {
    it('should return guide with blocks', async () => {
      const response = await fetch(`${API_BASE}/guides/guide_test_1`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('blocks');
      expect(Array.isArray(data.data.blocks)).toBe(true);
      expect(data.data.title).toBe('게스트하우스 이용 안내');
    });

    it('should return 404 for non-existent guide', async () => {
      const response = await fetch(`${API_BASE}/guides/non_existent_id`);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  /**
   * @TEST T0.5.2.29 - PATCH /api/guides/:id 테스트
   */
  describe('PATCH /api/guides/:id', () => {
    it('should update guide title', async () => {
      const response = await fetch(`${API_BASE}/guides/guide_test_1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '수정된 제목',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.title).toBe('수정된 제목');
    });

    it('should update guide with theme', async () => {
      const response = await fetch(`${API_BASE}/guides/guide_test_1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: {
            primaryColor: '#FF0000',
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.theme.primaryColor).toBe('#FF0000');
    });

    it('should return 404 for non-existent guide', async () => {
      const response = await fetch(`${API_BASE}/guides/non_existent_id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '수정' }),
      });

      expect(response.status).toBe(404);
    });
  });

  /**
   * @TEST T0.5.2.30 - DELETE /api/guides/:id 테스트
   */
  describe('DELETE /api/guides/:id', () => {
    it('should delete a guide', async () => {
      // 먼저 새 가이드 생성
      const createResponse = await fetch(`${API_BASE}/guides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '삭제할 가이드' }),
      });
      const { data: guide } = await createResponse.json();

      // 생성된 가이드 삭제
      const deleteResponse = await fetch(`${API_BASE}/guides/${guide.id}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);
      const data = await deleteResponse.json();
      expect(data.data.deleted).toBe(true);
    });

    it('should return 404 for non-existent guide', async () => {
      const response = await fetch(`${API_BASE}/guides/non_existent_id`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });

  /**
   * @TEST T0.5.2.31 - POST /api/guides/:id/publish 테스트
   */
  describe('POST /api/guides/:id/publish', () => {
    it('should publish guide with slug', async () => {
      const response = await fetch(`${API_BASE}/guides/guide_test_2/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'new-published-guide',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.slug).toBe('new-published-guide');
      expect(data.data.isPublished).toBe(true);
    });

    it('should reject duplicate slug', async () => {
      const response = await fetch(`${API_BASE}/guides/guide_test_2/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'guesthouse-guide', // 이미 사용 중
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error.code).toBe('CONFLICT');
    });

    it('should reject invalid slug format', async () => {
      const response = await fetch(`${API_BASE}/guides/guide_test_2/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'Invalid Slug',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  /**
   * @TEST T0.5.2.32 - POST /api/guides/check-slug 테스트
   */
  describe('POST /api/guides/check-slug', () => {
    it('should return available for new slug', async () => {
      const response = await fetch(`${API_BASE}/guides/check-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'absolutely-new-slug',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.available).toBe(true);
    });

    it('should return unavailable for existing slug', async () => {
      const response = await fetch(`${API_BASE}/guides/check-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'guesthouse-guide',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.available).toBe(false);
      expect(data.suggestion).toBeDefined();
    });
  });

  /**
   * @TEST T0.5.2.33 - GET /api/guides/public/:slug 테스트
   */
  describe('GET /api/guides/public/:slug', () => {
    it('should return published guide by slug', async () => {
      const response = await fetch(
        `${API_BASE}/guides/public/guesthouse-guide`
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.slug).toBe('guesthouse-guide');
      expect(data.data.isPublished).toBe(true);
    });

    it('should return 404 for unpublished guide', async () => {
      const response = await fetch(
        `${API_BASE}/guides/public/nonexistent-guide`
      );

      expect(response.status).toBe(404);
    });
  });
});
