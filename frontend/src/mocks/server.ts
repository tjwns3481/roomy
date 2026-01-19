// @TEST T0.5.2 - MSW Node 서버 설정
// @SPEC https://mswjs.io/docs/getting-started/node

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Node 서버 설정
 *
 * 용도:
 * - Vitest + Node 환경에서 API Mock
 * - 테스트 환경에서의 API 인터셉션
 */
export const server = setupServer(...handlers);
