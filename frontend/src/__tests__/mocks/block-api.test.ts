// @TEST T0.5.2 - MSW Mock 블록 API 테스트
// @SPEC frontend/src/mocks/handlers/blocks.ts

import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:3000/api';

describe('MSW Block Handlers', () => {
  /**
   * @TEST T0.5.2.38 - POST /api/guides/:guideId/blocks 테스트
   */
  describe('POST /api/guides/:guideId/blocks', () => {
    it('should create a new block', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'HERO',
            order: 0,
            content: {
              imageUrl: 'https://example.com/hero.jpg',
              title: 'Welcome',
              subtitle: 'Hello World',
            },
          }),
        }
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
      expect(data.data.type).toBe('HERO');
      expect(data.data.guideId).toBe('guide_test_1');
    });

    it('should reject request without type', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: 0,
          }),
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  /**
   * @TEST T0.5.2.39 - GET /api/guides/:guideId/blocks 테스트
   */
  describe('GET /api/guides/:guideId/blocks', () => {
    it('should return list of blocks for guide', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks`
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('type');
      expect(data.data[0]).toHaveProperty('order');
    });

    it('should return empty array for guide with no blocks', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_2/blocks`
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(0);
    });

    it('should return blocks sorted by order', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks`
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      for (let i = 0; i < data.data.length - 1; i++) {
        expect(data.data[i].order).toBeLessThanOrEqual(
          data.data[i + 1].order
        );
      }
    });
  });

  /**
   * @TEST T0.5.2.40 - PATCH /api/guides/:guideId/blocks/:blockId 테스트
   */
  describe('PATCH /api/guides/:guideId/blocks/:blockId', () => {
    it('should update block content', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/block_test_1`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: {
              imageUrl: 'https://example.com/new-hero.jpg',
              title: 'Updated Title',
              subtitle: 'Updated Subtitle',
            },
          }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.content.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent block', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/non_existent`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { title: 'New Title' },
          }),
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  /**
   * @TEST T0.5.2.41 - DELETE /api/guides/:guideId/blocks/:blockId 테스트
   */
  describe('DELETE /api/guides/:guideId/blocks/:blockId', () => {
    it('should delete a block', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/block_test_1`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.deleted).toBe(true);
    });

    it('should return 404 for non-existent block', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/non_existent`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  /**
   * @TEST T0.5.2.42 - POST /api/guides/:guideId/blocks/reorder 테스트
   */
  describe('POST /api/guides/:guideId/blocks/reorder', () => {
    it('should reorder blocks', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/reorder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [
              { id: 'block_test_1', order: 0 },
              { id: 'block_test_2', order: 1 },
              { id: 'block_test_3', order: 2 },
              { id: 'block_test_4', order: 3 },
            ],
          }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.updated).toBeGreaterThan(0);
    });

    it('should reject invalid blocks format', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/reorder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: 'not an array',
          }),
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle non-existent blocks gracefully', async () => {
      const response = await fetch(
        `${API_BASE}/guides/guide_test_1/blocks/reorder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [
              { id: 'non_existent_1', order: 0 },
              { id: 'non_existent_2', order: 1 },
            ],
          }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.updated).toBe(0);
    });
  });
});
