// @TASK T0.5.1 - 사용자 API 계약 정의
// @SPEC docs/planning/02-trd.md#접근제어-권한-모델

import { z } from 'zod';
import { BaseEntitySchema, PlanSchema, createApiResponseSchema } from './types';

// ============================================================================
// User Schemas
// ============================================================================

/**
 * 사용자 기본 스키마 (DB 모델 매핑)
 */
export const UserSchema = BaseEntitySchema.omit({ updatedAt: true }).extend({
  id: z.string(), // Clerk user ID (cuid가 아님)
  email: z.string().email(),
  name: z.string().max(100).nullable(),
  imageUrl: z.string().url().nullable(),
  plan: PlanSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * 사용자 공개 프로필 (다른 사용자에게 노출되는 정보)
 */
export const UserPublicProfileSchema = UserSchema.pick({
  id: true,
  name: true,
  imageUrl: true,
});

export type UserPublicProfile = z.infer<typeof UserPublicProfileSchema>;

/**
 * 현재 사용자 정보 (본인 조회용)
 */
export const CurrentUserSchema = UserSchema.extend({
  guideCount: z.number().int().nonnegative(),
  guideLimit: z.number().int().positive(),
  canCreateGuide: z.boolean(),
});

export type CurrentUser = z.infer<typeof CurrentUserSchema>;

// ============================================================================
// Plan Limits (플랜별 제한)
// ============================================================================

export const PlanLimitsSchema = z.object({
  guides: z.number().int().positive(),
  hasAnalytics: z.boolean(),
  hasCustomDomain: z.boolean(),
  hasRemoveWatermark: z.boolean(),
});

export type PlanLimits = z.infer<typeof PlanLimitsSchema>;

export const PLAN_LIMITS: Record<z.infer<typeof PlanSchema>, PlanLimits> = {
  FREE: {
    guides: 1,
    hasAnalytics: false,
    hasCustomDomain: false,
    hasRemoveWatermark: false,
  },
  PRO: {
    guides: 3,
    hasAnalytics: true,
    hasCustomDomain: false,
    hasRemoveWatermark: true,
  },
};

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * 사용자 정보 수정 요청
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이내로 입력해주세요').optional(),
  imageUrl: z.string().url('올바른 URL을 입력해주세요').nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Clerk Webhook 페이로드 (user.created, user.updated)
 */
export const ClerkUserWebhookSchema = z.object({
  id: z.string(),
  email_addresses: z.array(
    z.object({
      email_address: z.string().email(),
      id: z.string(),
    })
  ).min(1),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  image_url: z.string().url().nullable(),
});

export type ClerkUserWebhook = z.infer<typeof ClerkUserWebhookSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * 현재 사용자 조회 응답
 */
export const GetCurrentUserResponseSchema = createApiResponseSchema(CurrentUserSchema);
export type GetCurrentUserResponse = z.infer<typeof GetCurrentUserResponseSchema>;

/**
 * 사용자 정보 수정 응답
 */
export const UpdateUserResponseSchema = createApiResponseSchema(UserSchema);
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;

/**
 * 사용자 플랜 정보 응답
 */
export const GetUserPlanResponseSchema = createApiResponseSchema(
  z.object({
    plan: PlanSchema,
    limits: PlanLimitsSchema,
    usage: z.object({
      guides: z.number().int().nonnegative(),
    }),
  })
);
export type GetUserPlanResponse = z.infer<typeof GetUserPlanResponseSchema>;

// ============================================================================
// API Route Path Params
// ============================================================================

export const UserParamsSchema = z.object({
  id: z.string(),
});

export type UserParams = z.infer<typeof UserParamsSchema>;
