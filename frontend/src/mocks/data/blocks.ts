// @TEST T0.5.2 - Mock 블록 데이터
// @SPEC frontend/src/contracts/block.contract.ts

import { Block } from '@/contracts';

/**
 * Mock 블록 데이터
 */
export const MOCK_BLOCKS: Record<string, Block> = {
  'block_test_1': {
    id: 'block_test_1',
    guideId: 'guide_test_1',
    type: 'HERO',
    order: 0,
    content: {
      imageUrl: 'https://api.example.com/images/hero1.jpg',
      title: '게스트하우스에 오신 것을 환영합니다',
      subtitle: '편안한 숙박을 위한 모든 것을 준비했습니다',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  'block_test_2': {
    id: 'block_test_2',
    guideId: 'guide_test_1',
    type: 'QUICK_INFO',
    order: 1,
    content: {
      items: [
        { icon: 'clock', label: '체크인', value: '오후 3시' },
        { icon: 'clock', label: '체크아웃', value: '오전 11시' },
        { icon: 'wifi', label: 'WiFi', value: '비밀번호는 현관 게시판 참고' },
        { icon: 'key', label: '현관 비밀번호', value: '1234*' },
      ],
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  'block_test_3': {
    id: 'block_test_3',
    guideId: 'guide_test_1',
    type: 'AMENITIES',
    order: 2,
    content: {
      title: '편의시설',
      items: [
        { icon: 'wifi', name: '무료 WiFi', description: '전 객실에서 이용 가능' },
        { icon: 'kitchen', name: '공용 주방', description: '세제, 조미료 제공' },
        { icon: 'washer', name: '세탁기', description: '3층 복도' },
        { icon: 'tv', name: '스마트 TV', description: 'Netflix 계정 공유' },
      ],
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  'block_test_4': {
    id: 'block_test_4',
    guideId: 'guide_test_1',
    type: 'NOTICE',
    order: 3,
    content: {
      title: '주의사항',
      variant: 'warning',
      items: [
        { id: 'notice_1', icon: 'volume', text: '밤 10시 이후 소음은 자제해주세요' },
        { id: 'notice_2', icon: 'smoke', text: '객실 내 흡연 금지' },
        { id: 'notice_3', icon: 'pet', text: '반려동물 동반 불가' },
      ],
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  'block_test_5': {
    id: 'block_test_5',
    guideId: 'guide_test_3',
    type: 'HERO',
    order: 0,
    content: {
      imageUrl: 'https://api.example.com/images/hero_beach.jpg',
      title: '해변 펜션에 오신 것을 환영합니다',
      subtitle: '파도 소리와 함께하는 특별한 밤',
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  'block_test_6': {
    id: 'block_test_6',
    guideId: 'guide_test_3',
    type: 'GALLERY',
    order: 1,
    content: {
      title: '펜션 사진',
      images: [
        {
          id: 'img_1',
          url: 'https://api.example.com/images/beach1.jpg',
          caption: '메인 거실',
          order: 0,
        },
        {
          id: 'img_2',
          url: 'https://api.example.com/images/beach2.jpg',
          caption: '침실',
          order: 1,
        },
        {
          id: 'img_3',
          url: 'https://api.example.com/images/beach3.jpg',
          caption: '현관',
          order: 2,
        },
      ],
      layout: 'grid',
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
};
