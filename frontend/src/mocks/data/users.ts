// @TEST T0.5.2 - Mock 사용자 데이터
// @SPEC frontend/src/contracts/user.contract.ts

import { User, CurrentUser, PLAN_LIMITS } from '@/contracts';

/**
 * Mock 사용자 데이터
 */
export const MOCK_USERS: Record<string, User> = {
  'user_test_1': {
    id: 'user_test_1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    imageUrl: 'https://api.example.com/avatars/john.jpg',
    plan: 'FREE',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  'user_test_2': {
    id: 'user_test_2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    imageUrl: 'https://api.example.com/avatars/jane.jpg',
    plan: 'PRO',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  'user_test_3': {
    id: 'user_test_3',
    email: 'bob.wilson@example.com',
    name: null,
    imageUrl: null,
    plan: 'FREE',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
};

/**
 * 현재 로그인한 사용자 정보 (Guide 개수 포함)
 */
export const MOCK_CURRENT_USER: CurrentUser = {
  id: 'user_test_1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  imageUrl: 'https://api.example.com/avatars/john.jpg',
  plan: 'FREE',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  guideCount: 1,
  guideLimit: PLAN_LIMITS.FREE.guides,
  canCreateGuide: true,
};

/**
 * Pro 플랜 사용자 (Guide 여러 개 보유)
 */
export const MOCK_PRO_USER: CurrentUser = {
  id: 'user_test_2',
  email: 'jane.smith@example.com',
  name: 'Jane Smith',
  imageUrl: 'https://api.example.com/avatars/jane.jpg',
  plan: 'PRO',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-18'),
  guideCount: 2,
  guideLimit: PLAN_LIMITS.PRO.guides,
  canCreateGuide: true,
};

/**
 * 가이드 제한에 도달한 사용자
 */
export const MOCK_USER_AT_LIMIT: CurrentUser = {
  id: 'user_test_3',
  email: 'bob.wilson@example.com',
  name: 'Bob Wilson',
  imageUrl: null,
  plan: 'FREE',
  createdAt: new Date('2024-01-05'),
  updatedAt: new Date('2024-01-05'),
  guideCount: 1,
  guideLimit: PLAN_LIMITS.FREE.guides,
  canCreateGuide: false,
};
