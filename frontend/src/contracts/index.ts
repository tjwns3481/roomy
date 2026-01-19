// @TASK T0.5.1 - API 계약 Export
// @SPEC docs/planning/02-trd.md#Contract-First-Development

// ============================================================================
// Common Types
// ============================================================================
export {
  // Base schemas
  BaseEntitySchema,
  type BaseEntity,

  // API Response helpers
  createApiResponseSchema,
  createPaginatedResponseSchema,

  // Pagination
  PaginationMetaSchema,
  type PaginationMeta,
  PaginationQuerySchema,
  type PaginationQuery,

  // Error handling
  ErrorDetailSchema,
  type ErrorDetail,
  ErrorCodeSchema,
  type ErrorCode,
  ApiErrorSchema,
  type ApiError,

  // Enums
  PlanSchema,
  type Plan,
  BlockTypeSchema,
  type BlockType,

  // Utility types
  type ApiResponse,
  type PaginatedResponse,
  SuccessResponseSchema,
  type SuccessResponse,
} from './types';

// ============================================================================
// Guide Contract
// ============================================================================
export {
  // Theme
  ThemeSchema,
  type Theme,

  // Guide schemas
  GuideSchema,
  type Guide,
  GuideWithBlocksSchema,
  type GuideWithBlocks,
  GuideListItemSchema,
  type GuideListItem,

  // Request schemas
  CreateGuideSchema,
  type CreateGuideInput,
  UpdateGuideSchema,
  type UpdateGuideInput,
  PublishGuideSchema,
  type PublishGuideInput,
  CheckSlugSchema,
  type CheckSlugInput,
  GuideListQuerySchema,
  type GuideListQuery,

  // Response schemas
  CreateGuideResponseSchema,
  type CreateGuideResponse,
  GetGuideResponseSchema,
  type GetGuideResponse,
  UpdateGuideResponseSchema,
  type UpdateGuideResponse,
  GuideListResponseSchema,
  type GuideListResponse,
  CheckSlugResponseSchema,
  type CheckSlugResponse,
  PublishGuideResponseSchema,
  type PublishGuideResponse,

  // Path params
  GuideParamsSchema,
  type GuideParams,
  GuideSlugParamsSchema,
  type GuideSlugParams,
} from './guide.contract';

// ============================================================================
// Block Contract
// ============================================================================
export {
  // Content schemas (per block type)
  HeroContentSchema,
  type HeroContent,
  QuickInfoContentSchema,
  QuickInfoItemSchema,
  type QuickInfoContent,
  AmenitiesContentSchema,
  AmenityItemSchema,
  type AmenitiesContent,
  MapContentSchema,
  type MapContent,
  GalleryContentSchema,
  GalleryImageSchema,
  type GalleryContent,
  HostPickContentSchema,
  HostPickItemSchema,
  type HostPickContent,
  NoticeContentSchema,
  NoticeItemSchema,
  type NoticeContent,

  // Block content union
  BlockContentSchemas,
  BlockContentSchema,
  type BlockContent,

  // Block schemas
  BlockSchema,
  type Block,
  createTypedBlockSchema,

  // Request schemas
  CreateBlockSchema,
  type CreateBlockInput,
  UpdateBlockSchema,
  type UpdateBlockInput,
  ReorderBlocksSchema,
  type ReorderBlocksInput,

  // Response schemas
  CreateBlockResponseSchema,
  type CreateBlockResponse,
  UpdateBlockResponseSchema,
  type UpdateBlockResponse,
  ReorderBlocksResponseSchema,
  type ReorderBlocksResponse,
  DeleteBlockResponseSchema,
  type DeleteBlockResponse,

  // Path params
  BlockParamsSchema,
  type BlockParams,
  GuideBlocksParamsSchema,
  type GuideBlocksParams,

  // Default content
  DEFAULT_BLOCK_CONTENT,
} from './block.contract';

// ============================================================================
// User Contract
// ============================================================================
export {
  // User schemas
  UserSchema,
  type User,
  UserPublicProfileSchema,
  type UserPublicProfile,
  CurrentUserSchema,
  type CurrentUser,

  // Plan
  PlanLimitsSchema,
  type PlanLimits,
  PLAN_LIMITS,

  // Request schemas
  UpdateUserSchema,
  type UpdateUserInput,
  ClerkUserWebhookSchema,
  type ClerkUserWebhook,

  // Response schemas
  GetCurrentUserResponseSchema,
  type GetCurrentUserResponse,
  UpdateUserResponseSchema,
  type UpdateUserResponse,
  GetUserPlanResponseSchema,
  type GetUserPlanResponse,

  // Path params
  UserParamsSchema,
  type UserParams,
} from './user.contract';
