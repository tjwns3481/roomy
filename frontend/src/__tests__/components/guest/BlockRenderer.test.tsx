// @TASK T3.2 - BlockRenderer 컴포넌트 테스트
// @SPEC docs/planning/02-trd.md

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Block } from '@/contracts';
import { BlockRenderer } from '@/components/guest/BlockRenderer';

describe('BlockRenderer', () => {
  describe('HERO 블록', () => {
    it('이미지, 제목, 부제목을 렌더링', () => {
      const block: Block = {
        id: '1',
        guideId: 'guide-1',
        type: 'HERO',
        order: 0,
        content: {
          imageUrl: 'https://example.com/hero.jpg',
          title: '환영합니다',
          subtitle: '편안한 숙소입니다',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByAltText('Hero')).toBeInTheDocument();
      expect(screen.getByText('환영합니다')).toBeInTheDocument();
      expect(screen.getByText('편안한 숙소입니다')).toBeInTheDocument();
    });

    it('이미지가 없으면 제목과 부제목만 렌더링', () => {
      const block: Block = {
        id: '1',
        guideId: 'guide-1',
        type: 'HERO',
        order: 0,
        content: {
          imageUrl: null,
          title: '환영합니다',
          subtitle: '편안한 숙소입니다',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.queryByAltText('Hero')).not.toBeInTheDocument();
      expect(screen.getByText('환영합니다')).toBeInTheDocument();
    });
  });

  describe('QUICK_INFO 블록', () => {
    it('빠른 정보 항목들을 렌더링', () => {
      const block: Block = {
        id: '2',
        guideId: 'guide-1',
        type: 'QUICK_INFO',
        order: 1,
        content: {
          items: [
            { icon: '🔑', label: '체크인', value: '15:00' },
            { icon: '🚪', label: '체크아웃', value: '11:00' },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText('체크인')).toBeInTheDocument();
      expect(screen.getByText('15:00')).toBeInTheDocument();
      expect(screen.getByText('체크아웃')).toBeInTheDocument();
      expect(screen.getByText('11:00')).toBeInTheDocument();
    });

    it('각 value에 복사 버튼이 표시됨', () => {
      const block: Block = {
        id: '2',
        guideId: 'guide-1',
        type: 'QUICK_INFO',
        order: 1,
        content: {
          items: [
            { icon: '📶', label: 'Wi-Fi', value: 'password123' },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      const copyButtons = screen.getAllByRole('button', { name: /복사/ });
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('AMENITIES 블록', () => {
    it('편의시설 목록을 렌더링', () => {
      const block: Block = {
        id: '3',
        guideId: 'guide-1',
        type: 'AMENITIES',
        order: 2,
        content: {
          title: '편의시설',
          items: [
            { icon: '🌡️', name: '에어컨', description: '냉난방 가능' },
            { icon: '📺', name: 'TV' },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText('편의시설')).toBeInTheDocument();
      expect(screen.getByText('에어컨')).toBeInTheDocument();
      expect(screen.getByText('냉난방 가능')).toBeInTheDocument();
      expect(screen.getByText('TV')).toBeInTheDocument();
    });
  });

  describe('MAP 블록', () => {
    it('위치 정보를 렌더링', () => {
      const block: Block = {
        id: '4',
        guideId: 'guide-1',
        type: 'MAP',
        order: 3,
        content: {
          title: '위치',
          address: '서울시 강남구 테헤란로 123',
          description: '지하철 2호선 역삼역 5번 출구',
          latitude: 37.5665,
          longitude: 126.9780,
          zoomLevel: 15,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText('위치')).toBeInTheDocument();
      expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
      expect(screen.getByText('지하철 2호선 역삼역 5번 출구')).toBeInTheDocument();
    });
  });

  describe('GALLERY 블록', () => {
    it('갤러리 이미지들을 렌더링', () => {
      const block: Block = {
        id: '5',
        guideId: 'guide-1',
        type: 'GALLERY',
        order: 4,
        content: {
          title: '갤러리',
          images: [
            { id: 'img-1', url: 'https://example.com/1.jpg', caption: '거실', order: 0 },
            { id: 'img-2', url: 'https://example.com/2.jpg', caption: '침실', order: 1 },
          ],
          layout: 'grid',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText('갤러리')).toBeInTheDocument();
      expect(screen.getByAltText('거실')).toBeInTheDocument();
      expect(screen.getByAltText('침실')).toBeInTheDocument();
    });
  });

  describe('HOST_PICK 블록', () => {
    it('호스트 추천 항목들을 렌더링', () => {
      const block: Block = {
        id: '6',
        guideId: 'guide-1',
        type: 'HOST_PICK',
        order: 5,
        content: {
          title: '호스트 추천',
          items: [
            {
              id: 'pick-1',
              category: '맛집',
              name: '서울김밥',
              description: '맛있는 김밥집',
              address: '서울시 강남구',
            },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText('호스트 추천')).toBeInTheDocument();
      expect(screen.getByText('맛집')).toBeInTheDocument();
      expect(screen.getByText('서울김밥')).toBeInTheDocument();
      expect(screen.getByText('맛있는 김밥집')).toBeInTheDocument();
    });
  });

  describe('NOTICE 블록', () => {
    it('주의사항을 렌더링', () => {
      const block: Block = {
        id: '7',
        guideId: 'guide-1',
        type: 'NOTICE',
        order: 6,
        content: {
          title: '주의사항',
          variant: 'warning',
          items: [
            { id: 'notice-1', icon: '⚠️', text: '금연' },
            { id: 'notice-2', icon: '🚫', text: '반려동물 불가' },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText('주의사항')).toBeInTheDocument();
      expect(screen.getByText('금연')).toBeInTheDocument();
      expect(screen.getByText('반려동물 불가')).toBeInTheDocument();
    });

    it('variant에 따라 다른 배경색 적용', () => {
      const dangerBlock: Block = {
        id: '7',
        guideId: 'guide-1',
        type: 'NOTICE',
        order: 6,
        content: {
          title: '주의사항',
          variant: 'danger',
          items: [{ id: 'notice-1', text: '위험' }],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { container } = render(<BlockRenderer block={dangerBlock} />);
      const noticeContainer = container.querySelector('.bg-red-50');
      expect(noticeContainer).toBeInTheDocument();
    });
  });

  describe('알 수 없는 블록 타입', () => {
    it('알 수 없는 타입은 아무것도 렌더링하지 않음', () => {
      const block = {
        id: '8',
        guideId: 'guide-1',
        type: 'UNKNOWN' as any,
        order: 7,
        content: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { container } = render(<BlockRenderer block={block} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
