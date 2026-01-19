// @TASK T5.1 - GuideList 컴포넌트 테스트
// @SPEC docs/planning/03-frontend-spec.md#안내서-목록-컴포넌트

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideList } from '@/components/dashboard/GuideList';
import { GuideListItem } from '@/contracts';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockGuides: GuideListItem[] = [
  {
    id: '1',
    title: '첫 번째 안내서',
    slug: 'first-guide',
    coverImage: 'https://example.com/image1.jpg',
    isPublished: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    blockCount: 5,
    viewCount: 100,
  },
  {
    id: '2',
    title: '두 번째 안내서',
    slug: null,
    coverImage: null,
    isPublished: false,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    blockCount: 3,
    viewCount: 0,
  },
];

describe('GuideList', () => {
  it('안내서 카드가 올바르게 렌더링되어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    expect(screen.getByText('첫 번째 안내서')).toBeInTheDocument();
    expect(screen.getByText('두 번째 안내서')).toBeInTheDocument();
  });

  it('발행 상태가 표시되어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    expect(screen.getByText('발행됨')).toBeInTheDocument();
    expect(screen.getByText('작성 중')).toBeInTheDocument();
  });

  it('블록 개수가 표시되어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    expect(screen.getByText('5개 블록')).toBeInTheDocument();
    expect(screen.getByText('3개 블록')).toBeInTheDocument();
  });

  it('조회수가 표시되어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    expect(screen.getByText('100회 조회')).toBeInTheDocument();
    expect(screen.getByText('0회 조회')).toBeInTheDocument();
  });

  it('편집 버튼이 작동해야 함', async () => {
    const user = userEvent.setup();
    const mockPush = vi.fn();

    // Mock useRouter directly in the test
    const nextNavigation = await import('next/navigation');
    vi.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    render(<GuideList guides={mockGuides} />);

    const editButtons = screen.getAllByText('편집');
    await user.click(editButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/editor/1');
  });

  it('발행된 안내서는 미리보기 링크가 있어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    const previewLink = screen.getByText('미리보기');
    expect(previewLink).toBeInTheDocument();
    expect(previewLink.closest('a')).toHaveAttribute('href', '/g/first-guide');
  });

  it('커버 이미지가 있으면 표시되어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    const images = screen.getAllByRole('img');
    const coverImage = images.find(
      (img) => img.getAttribute('src')?.includes('image1.jpg')
    );
    expect(coverImage).toBeInTheDocument();
  });

  it('커버 이미지가 없으면 기본 이미지가 표시되어야 함', () => {
    render(<GuideList guides={mockGuides} />);

    expect(screen.getByTestId('guide-2-placeholder')).toBeInTheDocument();
  });
});
