// @TEST T0.5.2 - MSW 브라우저 설정
// @SPEC https://mswjs.io/docs/getting-started/browser

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW 서비스 워커 설정
 *
 * 용도:
 * - Vitest + JSDOM 환경에서 API Mock
 * - Storybook에서 Mock API 사용
 * - 개발 환경에서의 독립적인 FE 개발
 */
export const worker = setupWorker(...handlers);
