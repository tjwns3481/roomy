// @TEST T0.5.2 - MSW Mock 사용자 API 테스트
// @SPEC frontend/src/mocks/handlers/users.ts

import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS } from '@/contracts';

const API_BASE = 'http://localhost:3000/api';

describe('MSW User Handlers', () => {
  /**
   * @TEST T0.5.2.34 - GET /api/user 테스트
   */
  describe('GET /api/user', () => {
    it('should return current user', async () => {
      const response = await fetch(`${API_BASE}/user`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('email');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('plan');
      expect(data.data).toHaveProperty('guideCount');
      expect(data.data).toHaveProperty('canCreateGuide');
    });

    it('should return correct user details', async () => {
      const response = await fetch(`${API_BASE}/user`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.email).toBe('john.doe@example.com');
      expect(data.data.name).toBe('John Doe');
      expect(data.data.plan).toBe('FREE');
    });
  });

  /**
   * @TEST T0.5.2.35 - PATCH /api/user 테스트
   */
  describe('PATCH /api/user', () => {
    it('should update user name', async () => {
      const response = await fetch(`${API_BASE}/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).toBe('Updated Name');
    });

    it('should update user image URL', async () => {
      const response = await fetch(`${API_BASE}/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://example.com/new-avatar.jpg',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.imageUrl).toBe('https://example.com/new-avatar.jpg');
    });

    it('should reject invalid name type', async () => {
      const response = await fetch(`${API_BASE}/user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 123, // Should be string
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  /**
   * @TEST T0.5.2.36 - GET /api/user/plan 테스트
   */
  describe('GET /api/user/plan', () => {
    it('should return user plan information', async () => {
      const response = await fetch(`${API_BASE}/user/plan`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('plan');
      expect(data.data).toHaveProperty('limits');
      expect(data.data).toHaveProperty('usage');
    });

    it('should return correct plan limits', async () => {
      const response = await fetch(`${API_BASE}/user/plan`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.plan).toBe('FREE');
      expect(data.data.limits.guides).toBe(PLAN_LIMITS.FREE.guides);
      expect(data.data.limits.hasRemoveWatermark).toBe(false);
    });

    it('should return guide usage', async () => {
      const response = await fetch(`${API_BASE}/user/plan`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.usage).toHaveProperty('guides');
      expect(typeof data.data.usage.guides).toBe('number');
    });
  });

  /**
   * @TEST T0.5.2.37 - GET /api/users/:id 테스트
   */
  describe('GET /api/users/:id', () => {
    it('should return user public profile', async () => {
      const response = await fetch(`${API_BASE}/users/user_test_1`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('name');
      expect(data.data).toHaveProperty('imageUrl');
      // Private fields should not be included
      expect(data.data).not.toHaveProperty('email');
      expect(data.data).not.toHaveProperty('plan');
    });

    it('should return correct public profile data', async () => {
      const response = await fetch(`${API_BASE}/users/user_test_1`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe('user_test_1');
      expect(data.data.name).toBe('John Doe');
    });

    it('should handle user with null name', async () => {
      const response = await fetch(`${API_BASE}/users/user_test_3`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await fetch(`${API_BASE}/users/non_existent_user`);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
