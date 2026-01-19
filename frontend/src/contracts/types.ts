// @TASK T0.5.1 - API 공통 타입 정의
// @SPEC docs/planning/02-trd.md#API-설계-원칙

import { z } from 'zod';

// ============================================================================
// Base Entity Schema
// ============================================================================

/**
 * 모든 엔티티의 기본 필드
 */
export const BaseEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// ============================================================================
// API Response Schemas
// ============================================================================

/**
 * 단일 데이터 응답 스키마 생성 함수
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
  });
}

/**
 * 페이지네이션 메타 정보
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * 페이지네이션 응답 스키마 생성 함수
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: z.array(dataSchema),
    meta: PaginationMetaSchema,
  });
}

/**
 * 페이지네이션 쿼리 파라미터
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ============================================================================
// Error Response Schemas
// ============================================================================

/**
 * 필드별 에러 상세 정보
 */
export const ErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

/**
 * API 에러 코드
 */
export const ErrorCodeSchema = z.enum([
  // Client Errors (4xx)
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMIT_EXCEEDED',
  'PLAN_LIMIT_EXCEEDED',

  // Server Errors (5xx)
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

/**
 * API 에러 응답
 */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.array(ErrorDetailSchema).optional(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ============================================================================
// Enums (Prisma 스키마와 동기화)
// ============================================================================

/**
 * 사용자 플랜
 */
export const PlanSchema = z.enum(['FREE', 'PRO']);
export type Plan = z.infer<typeof PlanSchema>;

/**
 * 블록 타입
 */
export const BlockTypeSchema = z.enum([
  'HERO',
  'QUICK_INFO',
  'AMENITIES',
  'MAP',
  'GALLERY',
  'HOST_PICK',
  'NOTICE',
]);
export type BlockType = z.infer<typeof BlockTypeSchema>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * API 응답 타입 추출 헬퍼
 */
export type ApiResponse<T> = {
  data: T;
};

/**
 * 페이지네이션 응답 타입 추출 헬퍼
 */
export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

/**
 * 성공 응답 타입 (단순)
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
