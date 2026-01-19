import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { EditorHeader } from '@/components/editor/EditorHeader';

// Mock stores
vi.mock('@/stores/blockStore', () => ({
  useBlockStore: () => [],
}));

describe('EditorLayout', () => {
  const mockProps = {
    pageId: 'test-page-id',
    title: '테스트 페이지',
    onBack: vi.fn(),
    onPublish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('3단 레이아웃이 렌더링되어야 함', () => {
    render(<EditorLayout {...mockProps} />);

    // 헤더 확인 (role로 찾기)
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // 블록 목록 확인
    expect(screen.getByTestId('block-list')).toBeInTheDocument();
    // 미리보기 패널 확인
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
  });

  it('헤더가 표시되어야 함', () => {
    render(<EditorLayout {...mockProps} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('블록 목록 영역이 있어야 함', () => {
    render(<EditorLayout {...mockProps} />);

    const blockList = screen.getByTestId('block-list');
    expect(blockList).toBeInTheDocument();
  });

  it('미리보기 패널이 있어야 함', () => {
    render(<EditorLayout {...mockProps} />);

    const previewPanel = screen.getByTestId('preview-panel');
    expect(previewPanel).toBeInTheDocument();
  });

  it('레이아웃에 올바른 그리드 클래스가 적용되어야 함', () => {
    const { container } = render(<EditorLayout {...mockProps} />);

    const gridLayout = container.querySelector('.grid');
    expect(gridLayout).toBeInTheDocument();
  });
});

describe('EditorHeader', () => {
  const mockProps = {
    title: '테스트 페이지',
    isSaving: false,
    onBack: vi.fn(),
    onPublish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('제목이 표시되어야 함', () => {
    render(<EditorHeader {...mockProps} />);

    expect(screen.getByText('테스트 페이지')).toBeInTheDocument();
  });

  it('뒤로가기 버튼이 있어야 함', () => {
    render(<EditorHeader {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /뒤로/i });
    expect(backButton).toBeInTheDocument();
  });

  it('발행 버튼이 있어야 함', () => {
    render(<EditorHeader {...mockProps} />);

    const publishButton = screen.getByRole('button', { name: /발행/i });
    expect(publishButton).toBeInTheDocument();
  });

  it('저장 중일 때 상태가 표시되어야 함', () => {
    render(<EditorHeader {...mockProps} isSaving={true} />);

    expect(screen.getByText(/저장 중/i)).toBeInTheDocument();
  });

  it('저장 완료 시 상태가 표시되어야 함', () => {
    render(<EditorHeader {...mockProps} isSaving={false} />);

    expect(screen.getByText(/저장됨/i)).toBeInTheDocument();
  });

  it('뒤로가기 버튼 클릭 시 onBack이 호출되어야 함', async () => {
    const user = userEvent.setup();
    render(<EditorHeader {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /뒤로/i });
    await user.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalledOnce();
  });

  it('발행 버튼 클릭 시 onPublish가 호출되어야 함', async () => {
    const user = userEvent.setup();
    render(<EditorHeader {...mockProps} />);

    const publishButton = screen.getByRole('button', { name: /발행/i });
    await user.click(publishButton);

    expect(mockProps.onPublish).toHaveBeenCalledOnce();
  });
});
