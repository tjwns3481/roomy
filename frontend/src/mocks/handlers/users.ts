// @TEST T0.5.2 - Mock 사용자 API 핸들러
// @SPEC frontend/src/contracts/user.contract.ts

import { http, HttpResponse } from 'msw';
import {
  MOCK_CURRENT_USER,
  MOCK_PRO_USER,
  MOCK_USERS,
  MOCK_USER_AT_LIMIT,
} from '../data/users';
import { PLAN_LIMITS } from '@/contracts';

const API_BASE = 'http://localhost:3000/api';

/**
 * 사용자 API Mock 핸들러
 */
export const userHandlers = [
  /**
   * GET /api/user - 현재 사용자 정보 조회
   * @TEST T0.5.2.1 - 로그인한 사용자 정보 반환
   */
  http.get(`${API_BASE}/user`, () => {
    return HttpResponse.json({
      data: MOCK_CURRENT_USER,
    }, { status: 200 });
  }),

  /**
   * PATCH /api/user - 사용자 정보 수정
   * @TEST T0.5.2.2 - 사용자 정보 업데이트
   */
  http.patch(`${API_BASE}/user`, async ({ request }) => {
    try {
      const body = await request.json() as Record<string, unknown>;

      // 입력값 검증
      if (body.name && typeof body.name !== 'string') {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '이름은 문자열이어야 합니다',
              details: [{ field: 'name', message: '잘못된 형식' }],
            },
          },
          { status: 400 }
        );
      }

      const updatedUser = {
        ...MOCK_CURRENT_USER,
        name: (body.name as string) || MOCK_CURRENT_USER.name,
        imageUrl: (body.imageUrl as string) || MOCK_CURRENT_USER.imageUrl,
        updatedAt: new Date(),
      };

      return HttpResponse.json({
        data: updatedUser,
      }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '사용자 정보 수정 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/user/plan - 사용자 플랜 정보 조회
   * @TEST T0.5.2.3 - 플랜 정보 및 사용량 반환
   */
  http.get(`${API_BASE}/user/plan`, () => {
    return HttpResponse.json({
      data: {
        plan: MOCK_CURRENT_USER.plan,
        limits: PLAN_LIMITS[MOCK_CURRENT_USER.plan],
        usage: {
          guides: MOCK_CURRENT_USER.guideCount,
        },
      },
    }, { status: 200 });
  }),

  /**
   * GET /api/users/:id - 사용자 공개 프로필 조회
   * @TEST T0.5.2.4 - 다른 사용자의 공개 프로필 반환
   */
  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const userId = params.id as string;
    const user = MOCK_USERS[userId];

    if (!user) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '사용자를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 공개 프로필 정보만 반환
    return HttpResponse.json({
      data: {
        id: user.id,
        name: user.name,
        imageUrl: user.imageUrl,
      },
    }, { status: 200 });
  }),
];
