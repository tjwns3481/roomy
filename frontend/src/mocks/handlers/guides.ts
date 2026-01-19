// @TEST T0.5.2 - Mock 안내서 API 핸들러
// @SPEC frontend/src/contracts/guide.contract.ts

import { http, HttpResponse } from 'msw';
import {
  MOCK_GUIDES,
  MOCK_GUIDE_LIST_ITEMS,
  MOCK_GUIDES_WITH_BLOCKS,
  RESERVED_SLUGS,
} from '../data/guides';
import { GuideListQuery } from '@/contracts';

const API_BASE = 'http://localhost:3000/api';

/**
 * 안내서 메모리 저장소 (Mock 데이터 변경용)
 */
const guidesStore = { ...MOCK_GUIDES };
const guideListStore = { ...MOCK_GUIDE_LIST_ITEMS };
const guidesWithBlocksStore = { ...MOCK_GUIDES_WITH_BLOCKS };

/**
 * 안내서 API Mock 핸들러
 * NOTE: 더 구체적인 경로를 먼저 정의해야 합니다 (check-slug, public/:slug 등)
 */
export const guideHandlers = [
  /**
   * POST /api/guides/check-slug - 슬러그 중복 확인 (구체적 경로 - 먼저 정의)
   * @TEST T0.5.2.11 - 슬러그 가용 여부 확인
   */
  http.post(`${API_BASE}/guides/check-slug`, async ({ request }) => {
    try {
      const body = await request.json() as Record<string, unknown>;
      const slug = body.slug as string;

      if (!slug || typeof slug !== 'string') {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '슬러그는 필수입니다',
              details: [{ field: 'slug', message: '필수 필드' }],
            },
          },
          { status: 400 }
        );
      }

      const isReserved = RESERVED_SLUGS.has(slug);
      const isUsed = Object.values(guidesStore).some(g => g.slug === slug);
      const available = !isReserved && !isUsed;

      let suggestion: string | undefined;
      if (!available) {
        suggestion = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      return HttpResponse.json({
        available,
        suggestion,
      }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '슬러그 확인 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/guides/public/:slug - Public 안내서 조회 (slug 기반, 구체적 경로)
   * @TEST T0.5.2.12 - Public 안내서 조회
   */
  http.get(`${API_BASE}/guides/public/:slug`, ({ params }) => {
    const slug = params.slug as string;
    const guide = Object.values(guidesStore).find(
      g => g.slug === slug && g.isPublished
    );

    if (!guide) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '안내서를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    const guideWithBlocks = guidesWithBlocksStore[guide.id] || {
      ...guide,
      blocks: [],
    };

    return HttpResponse.json({
      data: guideWithBlocks,
    }, { status: 200 });
  }),
  /**
   * POST /api/guides - 새 안내서 생성
   * @TEST T0.5.2.5 - 안내서 생성 성공
   */
  http.post(`${API_BASE}/guides`, async ({ request }) => {
    try {
      const body = await request.json() as Record<string, unknown>;

      // 필수 필드 검증
      if (!body.title || typeof body.title !== 'string') {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '제목을 입력해주세요',
              details: [{ field: 'title', message: '필수 필드' }],
            },
          },
          { status: 400 }
        );
      }

      const now = new Date();
      const newGuide = {
        id: `guide_${Date.now()}`,
        userId: 'user_test_1',
        title: body.title as string,
        slug: null,
        description: (body.description as string) || null,
        coverImage: null,
        isPublished: false,
        theme: {
          primaryColor: '#3B82F6',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Pretendard',
          borderRadius: 'md' as const,
        },
        createdAt: now,
        updatedAt: now,
      };

      guidesStore[newGuide.id] = newGuide;
      guideListStore[newGuide.id] = {
        id: newGuide.id,
        title: newGuide.title,
        slug: newGuide.slug,
        coverImage: newGuide.coverImage,
        isPublished: newGuide.isPublished,
        createdAt: newGuide.createdAt,
        updatedAt: newGuide.updatedAt,
        blockCount: 0,
        viewCount: 0,
      };

      return HttpResponse.json({
        data: newGuide,
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '안내서 생성 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/guides - 안내서 목록 조회
   * @TEST T0.5.2.6 - 페이지네이션과 함께 안내서 목록 반환
   */
  http.get(`${API_BASE}/guides`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const isPublished = url.searchParams.get('isPublished');
    const search = url.searchParams.get('search') || '';

    // 필터링
    let items = Object.values(guideListStore);

    if (isPublished !== null) {
      const published = isPublished === 'true';
      items = items.filter(item => item.isPublished === published);
    }

    if (search) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 페이지네이션
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const paginatedItems = items.slice(startIdx, startIdx + limit);

    return HttpResponse.json({
      data: paginatedItems,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    }, { status: 200 });
  }),

  /**
   * GET /api/guides/:id - 안내서 상세 조회 (블록 포함)
   * @TEST T0.5.2.7 - 안내서와 블록 정보 반환
   */
  http.get(`${API_BASE}/guides/:id`, ({ params }) => {
    const guideId = params.id as string;
    const guide = guidesWithBlocksStore[guideId];

    if (!guide) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '안내서를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: guide,
    }, { status: 200 });
  }),

  /**
   * PATCH /api/guides/:id - 안내서 수정
   * @TEST T0.5.2.8 - 안내서 정보 업데이트
   */
  http.patch(`${API_BASE}/guides/:id`, async ({ params, request }) => {
    try {
      const guideId = params.id as string;
      const body = await request.json() as Record<string, unknown>;

      const guide = guidesStore[guideId];
      if (!guide) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: '안내서를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      const now = new Date();
      const updatedGuide = {
        ...guide,
        title: (body.title as string) || guide.title,
        description: body.description !== undefined ? (body.description as string) : guide.description,
        coverImage: body.coverImage !== undefined ? (body.coverImage as string) : guide.coverImage,
        theme: body.theme ? { ...guide.theme, ...body.theme } : guide.theme,
        updatedAt: now,
      };

      guidesStore[guideId] = updatedGuide;
      guideListStore[guideId] = {
        ...guideListStore[guideId],
        title: updatedGuide.title,
        coverImage: updatedGuide.coverImage,
        updatedAt: now,
      };

      if (guidesWithBlocksStore[guideId]) {
        guidesWithBlocksStore[guideId] = {
          ...updatedGuide,
          blocks: guidesWithBlocksStore[guideId].blocks,
        };
      }

      return HttpResponse.json({
        data: updatedGuide,
      }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '안내서 수정 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/guides/:id - 안내서 삭제
   * @TEST T0.5.2.9 - 안내서 삭제
   */
  http.delete(`${API_BASE}/guides/:id`, ({ params }) => {
    const guideId = params.id as string;

    if (!guidesStore[guideId]) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '안내서를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    delete guidesStore[guideId];
    delete guideListStore[guideId];
    delete guidesWithBlocksStore[guideId];

    return HttpResponse.json({
      data: { deleted: true },
    }, { status: 200 });
  }),

  /**
   * POST /api/guides/:id/publish - 안내서 발행 (slug 설정)
   * @TEST T0.5.2.10 - 안내서 발행 및 slug 설정
   */
  http.post(`${API_BASE}/guides/:id/publish`, async ({ params, request }) => {
    try {
      const guideId = params.id as string;
      const body = await request.json() as Record<string, unknown>;

      const guide = guidesStore[guideId];
      if (!guide) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: '안내서를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      const slug = body.slug as string;

      // Slug 검증
      if (!slug || typeof slug !== 'string') {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '슬러그는 필수입니다',
              details: [{ field: 'slug', message: '필수 필드' }],
            },
          },
          { status: 400 }
        );
      }

      if (slug.length < 3) {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '슬러그는 3자 이상이어야 합니다',
              details: [{ field: 'slug', message: '최소 3자' }],
            },
          },
          { status: 400 }
        );
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '슬러그는 소문자, 숫자, 하이픈만 사용 가능합니다',
              details: [{ field: 'slug', message: '잘못된 형식' }],
            },
          },
          { status: 400 }
        );
      }

      // 슬러그 중복 검사
      if (RESERVED_SLUGS.has(slug) || Object.values(guidesStore).some(g => g.slug === slug)) {
        return HttpResponse.json(
          {
            error: {
              code: 'CONFLICT',
              message: '이미 사용 중인 슬러그입니다',
            },
          },
          { status: 409 }
        );
      }

      const now = new Date();
      const updatedGuide = {
        ...guide,
        slug,
        isPublished: true,
        updatedAt: now,
      };

      guidesStore[guideId] = updatedGuide;
      guideListStore[guideId] = {
        ...guideListStore[guideId],
        slug,
        isPublished: true,
        updatedAt: now,
      };

      if (guidesWithBlocksStore[guideId]) {
        guidesWithBlocksStore[guideId] = {
          ...updatedGuide,
          blocks: guidesWithBlocksStore[guideId].blocks,
        };
      }

      return HttpResponse.json({
        data: {
          id: updatedGuide.id,
          slug: updatedGuide.slug,
          isPublished: updatedGuide.isPublished,
        },
      }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '안내서 발행 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

];
