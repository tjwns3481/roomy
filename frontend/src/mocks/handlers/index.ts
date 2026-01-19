// @TEST T0.5.2 - Mock API 핸들러 Export
// @SPEC frontend/src/contracts

import { userHandlers } from './users';
import { guideHandlers } from './guides';
import { blockHandlers } from './blocks';

/**
 * 모든 MSW 핸들러를 통합
 */
export const handlers = [
  ...userHandlers,
  ...guideHandlers,
  ...blockHandlers,
];
