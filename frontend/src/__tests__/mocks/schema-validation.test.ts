// @TEST T0.5.2 - Mock 데이터 스키마 검증
// @SPEC frontend/src/contracts

import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  CurrentUserSchema,
  GuideSchema,
  GuideWithBlocksSchema,
  GuideListItemSchema,
  BlockSchema,
} from '@/contracts';
import {
  MOCK_USERS,
  MOCK_CURRENT_USER,
  MOCK_GUIDES,
  MOCK_GUIDE_LIST_ITEMS,
  MOCK_GUIDES_WITH_BLOCKS,
  MOCK_BLOCKS,
} from '@/mocks/data';

describe('Mock Data Schema Validation', () => {
  /**
   * @TEST T0.5.2.43 - Mock User 데이터 스키마 검증
   */
  describe('User Data Validation', () => {
    it('should validate all mock users against UserSchema', () => {
      Object.entries(MOCK_USERS).forEach(([id, user]) => {
        const result = UserSchema.safeParse(user);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBeDefined();
          expect(result.data.email).toBeDefined();
          expect(result.data.plan).toMatch(/FREE|PRO/);
        }
      });
    });

    it('should validate current user against CurrentUserSchema', () => {
      const result = CurrentUserSchema.safeParse(MOCK_CURRENT_USER);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guideCount).toBeGreaterThanOrEqual(0);
        expect(result.data.guideLimit).toBeGreaterThan(0);
      }
    });
  });

  /**
   * @TEST T0.5.2.44 - Mock Guide 데이터 스키마 검증
   */
  describe('Guide Data Validation', () => {
    it('should validate all mock guides against GuideSchema', () => {
      Object.entries(MOCK_GUIDES).forEach(([id, guide]) => {
        const result = GuideSchema.safeParse(guide);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBeDefined();
          expect(result.data.title.length).toBeGreaterThan(0);
          expect(result.data.userId).toBeDefined();
        }
      });
    });

    it('should validate all guide list items against GuideListItemSchema', () => {
      Object.entries(MOCK_GUIDE_LIST_ITEMS).forEach(([id, item]) => {
        const result = GuideListItemSchema.safeParse(item);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.blockCount).toBeGreaterThanOrEqual(0);
          expect(result.data.viewCount).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should validate all guides with blocks against GuideWithBlocksSchema', () => {
      Object.entries(MOCK_GUIDES_WITH_BLOCKS).forEach(([id, guide]) => {
        const result = GuideWithBlocksSchema.safeParse(guide);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(Array.isArray(result.data.blocks)).toBe(true);
        }
      });
    });

    it('should have matching guide data in all stores', () => {
      Object.keys(MOCK_GUIDES).forEach(guideId => {
        expect(MOCK_GUIDE_LIST_ITEMS).toHaveProperty(guideId);
        // Not all guides need to have blocks
      });
    });
  });

  /**
   * @TEST T0.5.2.45 - Mock Block 데이터 스키마 검증
   */
  describe('Block Data Validation', () => {
    it('should validate all mock blocks against BlockSchema', () => {
      Object.entries(MOCK_BLOCKS).forEach(([id, block]) => {
        const result = BlockSchema.safeParse(block);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBeDefined();
          expect(result.data.guideId).toBeDefined();
          expect(result.data.type).toMatch(
            /HERO|QUICK_INFO|AMENITIES|MAP|GALLERY|HOST_PICK|NOTICE/
          );
          expect(result.data.order).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should have valid content for each block type', () => {
      Object.values(MOCK_BLOCKS).forEach(block => {
        expect(block.content).toBeDefined();
        expect(typeof block.content).toBe('object');

        // Type-specific content checks
        if (block.type === 'HERO') {
          expect(block.content).toHaveProperty('title');
          expect(block.content).toHaveProperty('subtitle');
        } else if (block.type === 'QUICK_INFO') {
          expect(block.content).toHaveProperty('items');
          expect(Array.isArray(block.content.items)).toBe(true);
        } else if (block.type === 'GALLERY') {
          expect(block.content).toHaveProperty('images');
          expect(Array.isArray(block.content.images)).toBe(true);
        }
      });
    });

    it('should have blocks referenced by guides', () => {
      Object.values(MOCK_GUIDES_WITH_BLOCKS).forEach(guide => {
        guide.blocks.forEach(block => {
          expect(MOCK_BLOCKS).toHaveProperty(block.id);
          expect(block.guideId).toBe(guide.id);
        });
      });
    });
  });

  /**
   * @TEST T0.5.2.46 - 데이터 일관성 검증
   */
  describe('Data Consistency', () => {
    it('should have valid user references in guides', () => {
      Object.values(MOCK_GUIDES).forEach(guide => {
        expect(MOCK_USERS).toHaveProperty(guide.userId);
      });
    });

    it('should have guide counts in list items', () => {
      Object.entries(MOCK_GUIDE_LIST_ITEMS).forEach(([guideId, item]) => {
        // blockCount should be a non-negative number
        expect(item.blockCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have consistent timestamps', () => {
      Object.values(MOCK_GUIDES).forEach(guide => {
        const createdAt = new Date(guide.createdAt);
        const updatedAt = new Date(guide.updatedAt);
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
          createdAt.getTime()
        );
      });
    });

    it('should not have published guides without slug', () => {
      Object.values(MOCK_GUIDES).forEach(guide => {
        if (guide.isPublished) {
          expect(guide.slug).not.toBeNull();
          expect(guide.slug!.length).toBeGreaterThan(2);
        }
      });
    });
  });
});
