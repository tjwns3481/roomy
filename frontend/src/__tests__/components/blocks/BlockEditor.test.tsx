// @TASK T2.4 - 블록 컴포넌트 구현 (TDD)
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockEditor } from '@/components/blocks/BlockEditor';
import type { EditorBlock } from '@/stores/blockStore';

describe('BlockEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createMockBlock = (type: EditorBlock['type'], content: Record<string, unknown> = {}): EditorBlock => ({
    id: 'test-block-id',
    pageId: 'test-page',
    type,
    order: 0,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('HERO 타입 블록에 대해 HeroEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('HERO', {
      imageUrl: 'https://example.com/hero.jpg',
      title: 'Welcome',
      subtitle: 'To our place',
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText(/이미지 URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^제목$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^부제목$/)).toBeInTheDocument();
  });

  it('QUICK_INFO 타입 블록에 대해 QuickInfoEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('QUICK_INFO', {
      items: [],
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getAllByText(/빠른 정보/i).length).toBeGreaterThan(0);
  });

  it('AMENITIES 타입 블록에 대해 AmenitiesEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('AMENITIES', {
      title: '편의시설',
      items: [],
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getAllByText(/편의시설/i).length).toBeGreaterThan(0);
  });

  it('MAP 타입 블록에 대해 MapEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('MAP', {
      title: '위치',
      address: '',
      latitude: null,
      longitude: null,
      zoomLevel: 15,
      description: '',
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText(/주소/i)).toBeInTheDocument();
  });

  it('GALLERY 타입 블록에 대해 GalleryEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('GALLERY', {
      title: '갤러리',
      images: [],
      layout: 'grid',
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // GalleryEditor는 input에 title 값을 설정하므로 displayValue로 확인
    expect(screen.getByDisplayValue(/갤러리/i)).toBeInTheDocument();
  });

  it('HOST_PICK 타입 블록에 대해 HostPickEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('HOST_PICK', {
      title: '호스트 추천',
      items: [],
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // HostPickEditor는 input에 title 값을 설정하므로 displayValue로 확인
    expect(screen.getByDisplayValue(/호스트 추천/i)).toBeInTheDocument();
  });

  it('NOTICE 타입 블록에 대해 NoticeEditor가 렌더링되어야 함', () => {
    const block = createMockBlock('NOTICE', {
      title: '주의사항',
      variant: 'info',
      items: [],
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // NoticeEditor는 input에 title 값을 설정하므로 displayValue로 확인
    expect(screen.getByDisplayValue(/주의사항/i)).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDelete가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const block = createMockBlock('HERO', {
      imageUrl: null,
      title: '',
      subtitle: '',
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /삭제/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('content 변경 시 onUpdate가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const block = createMockBlock('HERO', {
      imageUrl: null,
      title: '',
      subtitle: '',
    });

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const titleInput = screen.getByLabelText(/^제목$/);
    await user.type(titleInput, 'New Title');

    expect(mockOnUpdate).toHaveBeenCalled();
    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('New Title'),
      })
    );
  });
});

describe('HeroEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createHeroBlock = (content: Partial<{ imageUrl: string | null; title: string; subtitle: string }> = {}): EditorBlock => ({
    id: 'hero-block',
    pageId: 'test-page',
    type: 'HERO',
    order: 0,
    content: {
      imageUrl: null,
      title: '',
      subtitle: '',
      ...content,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('이미지 URL 입력이 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createHeroBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const imageUrlInput = screen.getByLabelText(/이미지 URL/i);
    await user.type(imageUrlInput, 'https://example.com/image.jpg');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: expect.stringContaining('https://example.com/image.jpg'),
      })
    );
  });

  it('제목 입력이 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createHeroBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const titleInput = screen.getByLabelText(/^제목$/i);
    await user.type(titleInput, '환영합니다');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('환영합니다'),
      })
    );
  });

  it('부제목 입력이 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createHeroBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const subtitleInput = screen.getByLabelText(/부제목/i);
    await user.type(subtitleInput, '편안한 숙소');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: expect.stringContaining('편안한 숙소'),
      })
    );
  });
});

describe('QuickInfoEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createQuickInfoBlock = (items: Array<{ icon: string; label: string; value: string }> = []): EditorBlock => ({
    id: 'quick-info-block',
    pageId: 'test-page',
    type: 'QUICK_INFO',
    order: 0,
    content: {
      items,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('항목 추가 버튼이 렌더링되어야 함', () => {
    const block = createQuickInfoBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /항목 추가/i })).toBeInTheDocument();
  });

  it('항목 추가 버튼 클릭 시 새 항목이 추가되어야 함', async () => {
    const user = userEvent.setup();
    const block = createQuickInfoBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const addButton = screen.getByRole('button', { name: /항목 추가/i });
    await user.click(addButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            icon: expect.any(String),
            label: expect.any(String),
            value: expect.any(String),
          }),
        ]),
      })
    );
  });

  it('기존 항목이 올바르게 렌더링되어야 함', () => {
    const block = createQuickInfoBlock([
      { icon: 'clock', label: '체크인', value: '15:00' },
      { icon: 'wifi', label: 'Wi-Fi', value: '무료' },
    ]);

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByDisplayValue('체크인')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
  });
});

describe('AmenitiesEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createAmenitiesBlock = (
    title: string = '편의시설',
    items: Array<{ icon: string; name: string; description?: string }> = []
  ): EditorBlock => ({
    id: 'amenities-block',
    pageId: 'test-page',
    type: 'AMENITIES',
    order: 0,
    content: {
      title,
      items,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('제목 편집이 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createAmenitiesBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const titleInput = screen.getByDisplayValue('편의시설');
    await user.clear(titleInput);
    await user.type(titleInput, '시설 안내');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('시설 안내'),
      })
    );
  });

  it('편의시설 항목 추가가 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createAmenitiesBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const addButton = screen.getByRole('button', { name: /항목 추가/i });
    await user.click(addButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            icon: expect.any(String),
            name: expect.any(String),
          }),
        ]),
      })
    );
  });
});

describe('MapEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createMapBlock = (content: Partial<{
    title: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    zoomLevel: number;
    description: string;
  }> = {}): EditorBlock => ({
    id: 'map-block',
    pageId: 'test-page',
    type: 'MAP',
    order: 0,
    content: {
      title: '위치',
      address: '',
      latitude: null,
      longitude: null,
      zoomLevel: 15,
      description: '',
      ...content,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('주소 입력이 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createMapBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const addressInput = screen.getByLabelText(/주소/i);
    await user.type(addressInput, '서울시 강남구');

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.stringContaining('서울시 강남구'),
      })
    );
  });

  it('위도/경도 입력이 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createMapBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const latInput = screen.getByLabelText(/위도/i);
    await user.type(latInput, '37.5');

    expect(mockOnUpdate).toHaveBeenCalled();
  });
});

describe('GalleryEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createGalleryBlock = (
    title: string = '갤러리',
    images: Array<{ id: string; url: string; caption?: string; order: number }> = [],
    layout: 'grid' | 'carousel' | 'masonry' = 'grid'
  ): EditorBlock => ({
    id: 'gallery-block',
    pageId: 'test-page',
    type: 'GALLERY',
    order: 0,
    content: {
      title,
      images,
      layout,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('이미지 추가 버튼이 렌더링되어야 함', () => {
    const block = createGalleryBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /이미지 추가/i })).toBeInTheDocument();
  });

  it('레이아웃 선택이 가능해야 함', () => {
    const block = createGalleryBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText(/레이아웃/i)).toBeInTheDocument();
  });
});

describe('HostPickEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createHostPickBlock = (
    title: string = '호스트 추천',
    items: Array<{
      id: string;
      category: string;
      name: string;
      description: string;
      imageUrl?: string | null;
      address?: string;
      link?: string;
    }> = []
  ): EditorBlock => ({
    id: 'host-pick-block',
    pageId: 'test-page',
    type: 'HOST_PICK',
    order: 0,
    content: {
      title,
      items,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('추천 항목 추가 버튼이 렌더링되어야 함', () => {
    const block = createHostPickBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /항목 추가/i })).toBeInTheDocument();
  });

  it('기존 추천 항목이 렌더링되어야 함', () => {
    const block = createHostPickBlock('호스트 추천', [
      {
        id: '1',
        category: '맛집',
        name: '맛있는 집',
        description: '정말 맛있어요',
        imageUrl: null,
      },
    ]);

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByDisplayValue('맛있는 집')).toBeInTheDocument();
  });
});

describe('NoticeEditor', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const createNoticeBlock = (
    title: string = '주의사항',
    variant: 'info' | 'warning' | 'danger' = 'info',
    items: Array<{ id: string; icon?: string; text: string }> = []
  ): EditorBlock => ({
    id: 'notice-block',
    pageId: 'test-page',
    type: 'NOTICE',
    order: 0,
    content: {
      title,
      variant,
      items,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('공지사항 타입 선택이 가능해야 함', () => {
    const block = createNoticeBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText(/타입/i)).toBeInTheDocument();
  });

  it('공지사항 항목 추가가 가능해야 함', async () => {
    const user = userEvent.setup();
    const block = createNoticeBlock();

    render(
      <BlockEditor
        block={block}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const addButton = screen.getByRole('button', { name: /항목 추가/i });
    await user.click(addButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            text: expect.any(String),
          }),
        ]),
      })
    );
  });
});
