// @TEST T0.5.2 - Mock 안내서 데이터
// @SPEC frontend/src/contracts/guide.contract.ts

import { Guide, GuideWithBlocks, GuideListItem, Theme } from '@/contracts';
import { MOCK_BLOCKS } from './blocks';

/**
 * 기본 테마 설정
 */
const DEFAULT_THEME: Theme = {
  primaryColor: '#3B82F6',
  backgroundColor: '#FFFFFF',
  fontFamily: 'Pretendard',
  borderRadius: 'md',
};

/**
 * Mock 안내서 데이터
 */
export const MOCK_GUIDES: Record<string, Guide> = {
  'guide_test_1': {
    id: 'guide_test_1',
    userId: 'user_test_1',
    title: '게스트하우스 이용 안내',
    slug: 'guesthouse-guide',
    description: '저희 게스트하우스를 방문하신 고객분들을 위한 종합 안내서입니다.',
    coverImage: 'https://api.example.com/covers/guide1.jpg',
    isPublished: true,
    theme: DEFAULT_THEME,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  'guide_test_2': {
    id: 'guide_test_2',
    userId: 'user_test_1',
    title: '서울 한옥 스테이',
    slug: null,
    description: null,
    coverImage: null,
    isPublished: false,
    theme: DEFAULT_THEME,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  'guide_test_3': {
    id: 'guide_test_3',
    userId: 'user_test_2',
    title: '해변 펜션 가이드',
    slug: 'beach-pension',
    description: '해변가에 위치한 펜션의 모든 정보를 담았습니다.',
    coverImage: 'https://api.example.com/covers/guide3.jpg',
    isPublished: true,
    theme: {
      primaryColor: '#EC4899',
      backgroundColor: '#FDF2F8',
      fontFamily: 'Pretendard',
      borderRadius: 'lg',
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19'),
  },
};

/**
 * Mock 안내서 목록 (요약 정보)
 */
export const MOCK_GUIDE_LIST_ITEMS: Record<string, GuideListItem> = {
  'guide_test_1': {
    id: 'guide_test_1',
    title: '게스트하우스 이용 안내',
    slug: 'guesthouse-guide',
    coverImage: 'https://api.example.com/covers/guide1.jpg',
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    blockCount: 4,
    viewCount: 125,
  },
  'guide_test_2': {
    id: 'guide_test_2',
    title: '서울 한옥 스테이',
    slug: null,
    coverImage: null,
    isPublished: false,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    blockCount: 0,
    viewCount: 0,
  },
  'guide_test_3': {
    id: 'guide_test_3',
    title: '해변 펜션 가이드',
    slug: 'beach-pension',
    coverImage: 'https://api.example.com/covers/guide3.jpg',
    isPublished: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19'),
    blockCount: 6,
    viewCount: 342,
  },
};

/**
 * Mock 안내서 + 블록 포함 상세 정보
 */
export const MOCK_GUIDES_WITH_BLOCKS: Record<string, GuideWithBlocks> = {
  'guide_test_1': {
    ...MOCK_GUIDES['guide_test_1'],
    blocks: [
      MOCK_BLOCKS['block_test_1'],
      MOCK_BLOCKS['block_test_2'],
      MOCK_BLOCKS['block_test_3'],
      MOCK_BLOCKS['block_test_4'],
    ],
  },
  'guide_test_3': {
    ...MOCK_GUIDES['guide_test_3'],
    blocks: [
      MOCK_BLOCKS['block_test_5'],
      MOCK_BLOCKS['block_test_6'],
    ],
  },
};

/**
 * 예약된 슬러그 목록 (중복 검사용)
 */
export const RESERVED_SLUGS = new Set([
  'guesthouse-guide',
  'beach-pension',
  'api',
  'admin',
  'guest',
  'dashboard',
  'settings',
]);
