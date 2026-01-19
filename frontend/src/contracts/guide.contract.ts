// @TASK T0.5.1 - 안내서 API 계약 정의
// @SPEC docs/planning/02-trd.md#주요-API-엔드포인트

import { z } from 'zod';
import {
  BaseEntitySchema,
  PaginationQuerySchema,
  createApiResponseSchema,
  createPaginatedResponseSchema,
} from './types';
import { BlockSchema } from './block.contract';

// ============================================================================
// Theme Schema (안내서 테마 설정)
// ============================================================================

export const ThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  fontFamily: z.string().default('Pretendard'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
});

export type Theme = z.infer<typeof ThemeSchema>;

// ============================================================================
// Guide Schemas
// ============================================================================

/**
 * 안내서 기본 스키마 (DB 모델 매핑)
 */
export const GuideSchema = BaseEntitySchema.extend({
  userId: z.string(),
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).nullable(), // null when unpublished
  description: z.string().max(500).nullable(),
  coverImage: z.string().url().nullable(),
  isPublished: z.boolean(),
  theme: ThemeSchema,
});

export type Guide = z.infer<typeof GuideSchema>;

/**
 * 안내서 + 블록 포함 상세 스키마
 */
export const GuideWithBlocksSchema = GuideSchema.extend({
  blocks: z.array(BlockSchema),
});

export type GuideWithBlocks = z.infer<typeof GuideWithBlocksSchema>;

/**
 * 안내서 목록 아이템 (요약 정보)
 */
export const GuideListItemSchema = GuideSchema.pick({
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  blockCount: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative(),
});

export type GuideListItem = z.infer<typeof GuideListItemSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * 안내서 생성 요청
 */
export const CreateGuideSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이내로 입력해주세요').optional(),
});

export type CreateGuideInput = z.infer<typeof CreateGuideSchema>;

/**
 * 안내서 수정 요청
 */
export const UpdateGuideSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  theme: ThemeSchema.partial().optional(),
});

export type UpdateGuideInput = z.infer<typeof UpdateGuideSchema>;

/**
 * 안내서 발행 요청 (slug 설정)
 */
export const PublishGuideSchema = z.object({
  slug: z
    .string()
    .min(3, '슬러그는 3자 이상이어야 합니다')
    .max(50, '슬러그는 50자 이내로 입력해주세요')
    .regex(/^[a-z0-9-]+$/, '슬러그는 소문자, 숫자, 하이픈만 사용 가능합니다'),
});

export type PublishGuideInput = z.infer<typeof PublishGuideSchema>;

/**
 * 슬러그 중복 확인 요청
 */
export const CheckSlugSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
});

export type CheckSlugInput = z.infer<typeof CheckSlugSchema>;

/**
 * 안내서 목록 조회 쿼리
 */
export const GuideListQuerySchema = PaginationQuerySchema.extend({
  isPublished: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
});

export type GuideListQuery = z.infer<typeof GuideListQuerySchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * 안내서 생성 응답
 */
export const CreateGuideResponseSchema = createApiResponseSchema(GuideSchema);
export type CreateGuideResponse = z.infer<typeof CreateGuideResponseSchema>;

/**
 * 안내서 상세 응답 (블록 포함)
 */
export const GetGuideResponseSchema = createApiResponseSchema(GuideWithBlocksSchema);
export type GetGuideResponse = z.infer<typeof GetGuideResponseSchema>;

/**
 * 안내서 수정 응답
 */
export const UpdateGuideResponseSchema = createApiResponseSchema(GuideSchema);
export type UpdateGuideResponse = z.infer<typeof UpdateGuideResponseSchema>;

/**
 * 안내서 목록 응답
 */
export const GuideListResponseSchema = createPaginatedResponseSchema(GuideListItemSchema);
export type GuideListResponse = z.infer<typeof GuideListResponseSchema>;

/**
 * 슬러그 중복 확인 응답
 */
export const CheckSlugResponseSchema = z.object({
  available: z.boolean(),
  suggestion: z.string().optional(),
});

export type CheckSlugResponse = z.infer<typeof CheckSlugResponseSchema>;

/**
 * 안내서 발행 응답
 */
export const PublishGuideResponseSchema = createApiResponseSchema(
  GuideSchema.pick({
    id: true,
    slug: true,
    isPublished: true,
  })
);
export type PublishGuideResponse = z.infer<typeof PublishGuideResponseSchema>;

// ============================================================================
// API Route Path Params
// ============================================================================

export const GuideParamsSchema = z.object({
  id: z.string().min(1),
});

export type GuideParams = z.infer<typeof GuideParamsSchema>;

export const GuideSlugParamsSchema = z.object({
  slug: z.string().min(3).max(50),
});

export type GuideSlugParams = z.infer<typeof GuideSlugParamsSchema>;
