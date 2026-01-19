// @TEST T0.5.2 - Mock 블록 API 핸들러
// @SPEC frontend/src/contracts/block.contract.ts

import { http, HttpResponse } from 'msw';
import { MOCK_BLOCKS, MOCK_GUIDES_WITH_BLOCKS } from '../data';
import { DEFAULT_BLOCK_CONTENT } from '@/contracts';

const API_BASE = 'http://localhost:3000/api';

/**
 * 블록 메모리 저장소 (Mock 데이터 변경용)
 */
const blocksStore = { ...MOCK_BLOCKS };

/**
 * 블록 API Mock 핸들러
 */
export const blockHandlers = [
  /**
   * POST /api/guides/:guideId/blocks - 새 블록 생성
   * @TEST T0.5.2.13 - 블록 생성 성공
   */
  http.post(`${API_BASE}/guides/:guideId/blocks`, async ({ params, request }) => {
    try {
      const guideId = params.guideId as string;
      const body = await request.json() as Record<string, unknown>;

      // 필수 필드 검증
      if (!body.type || typeof body.type !== 'string') {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: '블록 타입을 지정해주세요',
              details: [{ field: 'type', message: '필수 필드' }],
            },
          },
          { status: 400 }
        );
      }

      const now = new Date();
      const blockType = body.type as keyof typeof DEFAULT_BLOCK_CONTENT;
      const newBlock = {
        id: `block_${Date.now()}`,
        guideId,
        type: blockType,
        order: (body.order as number) ?? 0,
        content: (body.content || DEFAULT_BLOCK_CONTENT[blockType] || { _placeholder: true }) as Record<string, unknown>,
        createdAt: now,
        updatedAt: now,
      };

      blocksStore[newBlock.id] = newBlock as typeof blocksStore[string];

      return HttpResponse.json({
        data: newBlock,
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '블록 생성 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

  /**
   * GET /api/guides/:guideId/blocks - 가이드의 블록 목록 조회
   * @TEST T0.5.2.14 - 블록 목록 조회
   */
  http.get(`${API_BASE}/guides/:guideId/blocks`, ({ params }) => {
    const guideId = params.guideId as string;
    const blocks = Object.values(blocksStore)
      .filter(block => block.guideId === guideId)
      .sort((a, b) => a.order - b.order);

    return HttpResponse.json({
      data: blocks,
    }, { status: 200 });
  }),

  /**
   * PATCH /api/guides/:guideId/blocks/:blockId - 블록 수정
   * @TEST T0.5.2.15 - 블록 content 업데이트
   */
  http.patch(`${API_BASE}/guides/:guideId/blocks/:blockId`, async ({ params, request }) => {
    try {
      const blockId = params.blockId as string;
      const body = await request.json() as Record<string, unknown>;

      const block = blocksStore[blockId];
      if (!block) {
        return HttpResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: '블록을 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      const now = new Date();
      const updatedBlock = {
        ...block,
        content: (body.content || block.content) as Record<string, unknown>,
        updatedAt: now,
      };

      blocksStore[blockId] = updatedBlock as typeof blocksStore[string];

      return HttpResponse.json({
        data: updatedBlock,
      }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '블록 수정 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),

  /**
   * DELETE /api/guides/:guideId/blocks/:blockId - 블록 삭제
   * @TEST T0.5.2.16 - 블록 삭제
   */
  http.delete(`${API_BASE}/guides/:guideId/blocks/:blockId`, ({ params }) => {
    const blockId = params.blockId as string;

    if (!blocksStore[blockId]) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '블록을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    delete blocksStore[blockId];

    return HttpResponse.json({
      data: { deleted: true },
    }, { status: 200 });
  }),

  /**
   * POST /api/guides/:guideId/blocks/reorder - 블록 순서 변경
   * @TEST T0.5.2.17 - 블록 순서 변경
   */
  http.post(`${API_BASE}/guides/:guideId/blocks/reorder`, async ({ params, request }) => {
    try {
      const guideId = params.guideId as string;
      const body = await request.json() as Record<string, unknown>;

      if (!Array.isArray(body.blocks)) {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'blocks는 배열이어야 합니다',
              details: [{ field: 'blocks', message: '배열 형식' }],
            },
          },
          { status: 400 }
        );
      }

      const now = new Date();
      let updated = 0;

      (body.blocks as Array<{ id: string; order: number }>).forEach(({ id, order }) => {
        if (blocksStore[id]) {
          blocksStore[id] = {
            ...blocksStore[id],
            order,
            updatedAt: now,
          };
          updated++;
        }
      });

      return HttpResponse.json({
        data: { updated },
      }, { status: 200 });
    } catch (error) {
      return HttpResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: '블록 순서 변경 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }
  }),
];
