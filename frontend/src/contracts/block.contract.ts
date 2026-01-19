// @TASK T0.5.1 - 블록 API 계약 정의
// @SPEC docs/planning/02-trd.md#API-설계-원칙

import { z } from 'zod';
import { BaseEntitySchema, BlockTypeSchema, createApiResponseSchema } from './types';

// ============================================================================
// Block Content Schemas (각 블록 타입별 content 구조)
// ============================================================================

/**
 * HERO 블록 - 메인 이미지와 환영 메시지
 */
export const HeroContentSchema = z.object({
  imageUrl: z.string().url().nullable().default(null),
  title: z.string().max(100).default(''),
  subtitle: z.string().max(200).default(''),
});

export type HeroContent = z.infer<typeof HeroContentSchema>;

/**
 * QUICK_INFO 블록 - 빠른 정보 (체크인/아웃, 와이파이 등)
 */
export const QuickInfoItemSchema = z.object({
  icon: z.string().max(50),
  label: z.string().max(50),
  value: z.string().max(200),
});

export const QuickInfoContentSchema = z.object({
  items: z.array(QuickInfoItemSchema).max(10).default([]),
});

export type QuickInfoContent = z.infer<typeof QuickInfoContentSchema>;

/**
 * AMENITIES 블록 - 편의시설 목록
 */
export const AmenityItemSchema = z.object({
  icon: z.string().max(50),
  name: z.string().max(100),
  description: z.string().max(300).optional(),
});

export const AmenitiesContentSchema = z.object({
  title: z.string().max(100).default('편의시설'),
  items: z.array(AmenityItemSchema).max(30).default([]),
});

export type AmenitiesContent = z.infer<typeof AmenitiesContentSchema>;

/**
 * MAP 블록 - 위치 정보
 */
export const MapContentSchema = z.object({
  title: z.string().max(100).default('위치'),
  address: z.string().max(300).default(''),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  zoomLevel: z.number().int().min(1).max(20).default(15),
  description: z.string().max(500).default(''),
});

export type MapContent = z.infer<typeof MapContentSchema>;

/**
 * GALLERY 블록 - 이미지 갤러리
 */
export const GalleryImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  caption: z.string().max(200).optional(),
  order: z.number().int().nonnegative(),
});

export const GalleryContentSchema = z.object({
  title: z.string().max(100).default('갤러리'),
  images: z.array(GalleryImageSchema).max(20).default([]),
  layout: z.enum(['grid', 'carousel', 'masonry']).default('grid'),
});

export type GalleryContent = z.infer<typeof GalleryContentSchema>;

/**
 * HOST_PICK 블록 - 호스트 추천
 */
export const HostPickItemSchema = z.object({
  id: z.string(),
  category: z.string().max(50),
  name: z.string().max(100),
  description: z.string().max(500),
  imageUrl: z.string().url().nullable().optional(),
  address: z.string().max(300).optional(),
  link: z.string().url().optional(),
});

export const HostPickContentSchema = z.object({
  title: z.string().max(100).default('호스트 추천'),
  items: z.array(HostPickItemSchema).max(20).default([]),
});

export type HostPickContent = z.infer<typeof HostPickContentSchema>;

/**
 * NOTICE 블록 - 공지/주의사항
 */
export const NoticeItemSchema = z.object({
  id: z.string(),
  icon: z.string().max(50).optional(),
  text: z.string().max(500),
});

export const NoticeContentSchema = z.object({
  title: z.string().max(100).default('주의사항'),
  variant: z.enum(['info', 'warning', 'danger']).default('info'),
  items: z.array(NoticeItemSchema).max(20).default([]),
});

export type NoticeContent = z.infer<typeof NoticeContentSchema>;

// ============================================================================
// Block Content Union (모든 블록 타입의 content)
// ============================================================================

/**
 * 블록 타입별 content 스키마 매핑
 */
export const BlockContentSchemas = {
  HERO: HeroContentSchema,
  QUICK_INFO: QuickInfoContentSchema,
  AMENITIES: AmenitiesContentSchema,
  MAP: MapContentSchema,
  GALLERY: GalleryContentSchema,
  HOST_PICK: HostPickContentSchema,
  NOTICE: NoticeContentSchema,
} as const;

/**
 * 블록 content discriminated union
 */
export const BlockContentSchema = z.union([
  HeroContentSchema,
  QuickInfoContentSchema,
  AmenitiesContentSchema,
  MapContentSchema,
  GalleryContentSchema,
  HostPickContentSchema,
  NoticeContentSchema,
]);

export type BlockContent = z.infer<typeof BlockContentSchema>;

// ============================================================================
// Block Schemas
// ============================================================================

/**
 * 블록 기본 스키마 (DB 모델 매핑)
 */
export const BlockSchema = BaseEntitySchema.extend({
  guideId: z.string().min(1),
  type: BlockTypeSchema,
  order: z.number().int().nonnegative(),
  content: z.record(z.unknown()), // JSON 타입, 런타임에 type별로 검증
});

export type Block = z.infer<typeof BlockSchema>;

/**
 * 타입별 블록 스키마 생성 헬퍼
 */
export function createTypedBlockSchema<T extends keyof typeof BlockContentSchemas>(type: T) {
  return BlockSchema.extend({
    type: z.literal(type),
    content: BlockContentSchemas[type],
  });
}

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * 블록 생성 요청
 */
export const CreateBlockSchema = z.object({
  type: BlockTypeSchema,
  order: z.number().int().nonnegative().optional(), // 미지정 시 맨 끝에 추가
  content: z.record(z.unknown()).optional(), // 미지정 시 기본값 사용
});

export type CreateBlockInput = z.infer<typeof CreateBlockSchema>;

/**
 * 블록 수정 요청
 */
export const UpdateBlockSchema = z.object({
  content: z.record(z.unknown()),
});

export type UpdateBlockInput = z.infer<typeof UpdateBlockSchema>;

/**
 * 블록 순서 변경 요청
 */
export const ReorderBlocksSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    })
  ).min(1),
});

export type ReorderBlocksInput = z.infer<typeof ReorderBlocksSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * 블록 생성 응답
 */
export const CreateBlockResponseSchema = createApiResponseSchema(BlockSchema);
export type CreateBlockResponse = z.infer<typeof CreateBlockResponseSchema>;

/**
 * 블록 수정 응답
 */
export const UpdateBlockResponseSchema = createApiResponseSchema(BlockSchema);
export type UpdateBlockResponse = z.infer<typeof UpdateBlockResponseSchema>;

/**
 * 블록 순서 변경 응답
 */
export const ReorderBlocksResponseSchema = createApiResponseSchema(
  z.object({
    updated: z.number().int().nonnegative(),
  })
);
export type ReorderBlocksResponse = z.infer<typeof ReorderBlocksResponseSchema>;

/**
 * 블록 삭제 응답
 */
export const DeleteBlockResponseSchema = createApiResponseSchema(
  z.object({
    deleted: z.boolean(),
  })
);
export type DeleteBlockResponse = z.infer<typeof DeleteBlockResponseSchema>;

// ============================================================================
// API Route Path Params
// ============================================================================

export const BlockParamsSchema = z.object({
  guideId: z.string().min(1),
  blockId: z.string().min(1),
});

export type BlockParams = z.infer<typeof BlockParamsSchema>;

export const GuideBlocksParamsSchema = z.object({
  guideId: z.string().min(1),
});

export type GuideBlocksParams = z.infer<typeof GuideBlocksParamsSchema>;

// ============================================================================
// Block Default Content (새 블록 생성 시 기본값)
// ============================================================================

export const DEFAULT_BLOCK_CONTENT: Record<z.infer<typeof BlockTypeSchema>, unknown> = {
  HERO: {
    imageUrl: null,
    title: '',
    subtitle: '',
  },
  QUICK_INFO: {
    items: [],
  },
  AMENITIES: {
    title: '편의시설',
    items: [],
  },
  MAP: {
    title: '위치',
    address: '',
    latitude: null,
    longitude: null,
    zoomLevel: 15,
    description: '',
  },
  GALLERY: {
    title: '갤러리',
    images: [],
    layout: 'grid',
  },
  HOST_PICK: {
    title: '호스트 추천',
    items: [],
  },
  NOTICE: {
    title: '주의사항',
    variant: 'info',
    items: [],
  },
};
