// @TEST T0.5.3 - Guide API 계약 검증 테스트
// @IMPL src/contracts/guide.contract.ts
// @SPEC docs/planning/02-trd.md#주요-API-엔드포인트

import { describe, it, expect } from 'vitest'
import {
  GuideSchema,
  GuideWithBlocksSchema,
  GuideListItemSchema,
  CreateGuideSchema,
  UpdateGuideSchema,
  PublishGuideSchema,
  CheckSlugSchema,
  GuideListQuerySchema,
  CreateGuideResponseSchema,
  GetGuideResponseSchema,
  UpdateGuideResponseSchema,
  GuideListResponseSchema,
  CheckSlugResponseSchema,
  PublishGuideResponseSchema,
  ThemeSchema,
  GuideParamsSchema,
  GuideSlugParamsSchema,
  type Guide,
  type GuideWithBlocks,
  type CreateGuideInput,
  type UpdateGuideInput,
  type PublishGuideInput,
  type Theme,
} from '@/contracts'

/**
 * @TEST T0.5.3.1 - Theme Schema 검증
 */
describe('ThemeSchema', () => {
  it('should validate correct theme object', () => {
    const theme: Theme = {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Pretendard',
      borderRadius: 'md',
    }

    const result = ThemeSchema.safeParse(theme)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.primaryColor).toBe('#3B82F6')
    }
  })

  it('should use default values for partial theme', () => {
    const result = ThemeSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.primaryColor).toBe('#3B82F6')
      expect(result.data.backgroundColor).toBe('#FFFFFF')
    }
  })

  it('should reject invalid color format', () => {
    const result = ThemeSchema.safeParse({
      primaryColor: 'invalid-color',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid borderRadius', () => {
    const result = ThemeSchema.safeParse({
      borderRadius: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})

/**
 * @TEST T0.5.3.2 - Guide Schema 검증
 */
describe('GuideSchema', () => {
  it('should validate correct guide object', () => {
    const guide = {
      id: 'guide_123',
      userId: 'user_123',
      title: 'My Guide',
      slug: 'my-guide',
      description: 'A test guide',
      coverImage: 'https://example.com/image.jpg',
      isPublished: false,
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Pretendard',
        borderRadius: 'md',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    } as const

    const result = GuideSchema.safeParse(guide)
    expect(result.success).toBe(true)
  })

  it('should reject guide without required fields', () => {
    const result = GuideSchema.safeParse({
      userId: 'user_123',
      // missing title
      slug: 'my-guide',
    })
    expect(result.success).toBe(false)
  })

  it('should reject guide with invalid slug', () => {
    const result = GuideSchema.safeParse({
      id: 'guide_123',
      userId: 'user_123',
      title: 'My Guide',
      slug: 'My Guide', // uppercase and space not allowed
      isPublished: false,
      theme: {},
    })
    expect(result.success).toBe(false)
  })

  it('should accept nullable description', () => {
    const result = GuideSchema.safeParse({
      id: 'guide_123',
      userId: 'user_123',
      title: 'My Guide',
      slug: 'my-guide',
      description: null,
      coverImage: null,
      isPublished: false,
      theme: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    expect(result.success).toBe(true)
  })
})

/**
 * @TEST T0.5.3.3 - GuideWithBlocks Schema 검증
 */
describe('GuideWithBlocksSchema', () => {
  it('should validate guide with empty blocks array', () => {
    const guideWithBlocks = {
      id: 'guide_123',
      userId: 'user_123',
      title: 'My Guide',
      slug: 'my-guide',
      description: null,
      coverImage: null,
      isPublished: false,
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Pretendard',
        borderRadius: 'md',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      blocks: [],
    }

    const result = GuideWithBlocksSchema.safeParse(guideWithBlocks)
    expect(result.success).toBe(true)
  })
})

/**
 * @TEST T0.5.3.4 - GuideListItem Schema 검증
 */
describe('GuideListItemSchema', () => {
  it('should validate guide list item', () => {
    const result = GuideListItemSchema.safeParse({
      id: 'guide_123',
      title: 'My Guide',
      slug: 'my-guide',
      coverImage: 'https://example.com/image.jpg',
      isPublished: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      blockCount: 5,
      viewCount: 100,
    })

    expect(result.success).toBe(true)
  })

  it('should reject guide list item with negative counts', () => {
    const result = GuideListItemSchema.safeParse({
      id: 'guide_123',
      title: 'My Guide',
      slug: 'my-guide',
      coverImage: null,
      isPublished: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      blockCount: -1,
      viewCount: 100,
    })

    expect(result.success).toBe(false)
  })
})

/**
 * @TEST T0.5.3.5 - CreateGuide Request Schema 검증
 */
describe('CreateGuideSchema', () => {
  it('should validate create guide request with title only', () => {
    const request: CreateGuideInput = {
      title: 'New Guide',
    }

    const result = CreateGuideSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('should validate create guide request with all fields', () => {
    const request: CreateGuideInput = {
      title: 'New Guide',
      description: 'A test guide',
    }

    const result = CreateGuideSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const result = CreateGuideSchema.safeParse({
      title: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject title exceeding max length', () => {
    const result = CreateGuideSchema.safeParse({
      title: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('should reject description exceeding max length', () => {
    const result = CreateGuideSchema.safeParse({
      title: 'Valid Title',
      description: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

/**
 * @TEST T0.5.3.6 - UpdateGuide Request Schema 검증
 */
describe('UpdateGuideSchema', () => {
  it('should validate partial update', () => {
    const request: UpdateGuideInput = {
      title: 'Updated Title',
    }

    const result = UpdateGuideSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('should validate update with theme', () => {
    const request: UpdateGuideInput = {
      title: 'Updated Title',
      theme: {
        primaryColor: '#FF0000',
      },
    }

    const result = UpdateGuideSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('should allow all fields to be undefined', () => {
    const result = UpdateGuideSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

/**
 * @TEST T0.5.3.7 - PublishGuide Request Schema 검증
 */
describe('PublishGuideSchema', () => {
  it('should validate valid slug', () => {
    const request: PublishGuideInput = {
      slug: 'my-published-guide',
    }

    const result = PublishGuideSchema.safeParse(request)
    expect(result.success).toBe(true)
  })

  it('should reject slug shorter than 3 characters', () => {
    const result = PublishGuideSchema.safeParse({
      slug: 'ab',
    })
    expect(result.success).toBe(false)
  })

  it('should reject slug exceeding max length', () => {
    const result = PublishGuideSchema.safeParse({
      slug: 'a'.repeat(51),
    })
    expect(result.success).toBe(false)
  })

  it('should reject slug with invalid characters', () => {
    const result = PublishGuideSchema.safeParse({
      slug: 'My Guide 123', // uppercase and space not allowed
    })
    expect(result.success).toBe(false)
  })

  it('should accept slug with numbers and hyphens', () => {
    const result = PublishGuideSchema.safeParse({
      slug: 'my-guide-123',
    })
    expect(result.success).toBe(true)
  })
})

/**
 * @TEST T0.5.3.8 - CheckSlug Request Schema 검증
 */
describe('CheckSlugSchema', () => {
  it('should validate valid slug check request', () => {
    const result = CheckSlugSchema.safeParse({
      slug: 'my-guide',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid slug', () => {
    const result = CheckSlugSchema.safeParse({
      slug: 'INVALID',
    })
    expect(result.success).toBe(false)
  })
})

/**
 * @TEST T0.5.3.9 - GuideList Query Schema 검증
 */
describe('GuideListQuerySchema', () => {
  it('should validate empty query', () => {
    const result = GuideListQuerySchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate query with pagination', () => {
    const result = GuideListQuerySchema.safeParse({
      page: 1,
      pageSize: 20,
    })
    expect(result.success).toBe(true)
  })

  it('should validate query with filters', () => {
    const result = GuideListQuerySchema.safeParse({
      isPublished: true,
      search: 'test',
      page: 1,
      pageSize: 10,
    })
    expect(result.success).toBe(true)
  })

  it('should coerce isPublished string to boolean', () => {
    const result = GuideListQuerySchema.safeParse({
      isPublished: 'true',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isPublished).toBe(true)
    }
  })
})

/**
 * @TEST T0.5.3.10 - Response Schemas 검증
 */
describe('Response Schemas', () => {
  it('should validate create guide response', () => {
    const result = CreateGuideResponseSchema.safeParse({
      data: {
        id: 'guide_123',
        userId: 'user_123',
        title: 'New Guide',
        slug: 'new-guide',
        description: null,
        coverImage: null,
        isPublished: false,
        theme: {
          primaryColor: '#3B82F6',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Pretendard',
          borderRadius: 'md',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    })

    expect(result.success).toBe(true)
  })

  it('should validate check slug response', () => {
    const result = CheckSlugResponseSchema.safeParse({
      available: true,
    })

    expect(result.success).toBe(true)
  })

  it('should validate check slug response with suggestion', () => {
    const result = CheckSlugResponseSchema.safeParse({
      available: false,
      suggestion: 'my-guide-1',
    })

    expect(result.success).toBe(true)
  })
})

/**
 * @TEST T0.5.3.11 - Path Params Schemas 검증
 */
describe('Path Params Schemas', () => {
  it('should validate guide params', () => {
    const result = GuideParamsSchema.safeParse({
      id: 'guide_123',
    })

    expect(result.success).toBe(true)
  })

  it('should reject empty id', () => {
    const result = GuideParamsSchema.safeParse({
      id: '',
    })

    expect(result.success).toBe(false)
  })

  it('should validate guide slug params', () => {
    const result = GuideSlugParamsSchema.safeParse({
      slug: 'my-guide',
    })

    expect(result.success).toBe(true)
  })

  it('should reject slug shorter than 3 characters', () => {
    const result = GuideSlugParamsSchema.safeParse({
      slug: 'ab',
    })

    expect(result.success).toBe(false)
  })
})
