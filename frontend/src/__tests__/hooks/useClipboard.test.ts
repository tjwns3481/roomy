// @TASK T3.3 - useClipboard 훅 테스트
// @SPEC docs/planning/02-trd.md

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboard } from '@/hooks/useClipboard';

describe('useClipboard', () => {
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Clipboard API 모킹
    mockClipboard = {
      writeText: vi.fn(),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('초기 상태는 copied가 false', () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.copied).toBe(false);
  });

  it('copy 함수를 호출하면 클립보드에 텍스트 복사', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard());

    let success: boolean = false;
    await act(async () => {
      success = await result.current.copy('test text');
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(success).toBe(true);
    expect(result.current.copied).toBe(true);
  });

  it('복사 후 timeout 시간이 지나면 copied가 false로 초기화', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard({ timeout: 1000 }));

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    // 1초 경과
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('클립보드 API가 실패하면 false 반환', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useClipboard());

    let success: boolean = true;
    await act(async () => {
      success = await result.current.copy('test text');
    });

    expect(success).toBe(false);
    expect(result.current.copied).toBe(false);
  });

  it('클립보드 API가 없으면 false 반환', async () => {
    Object.assign(navigator, { clipboard: undefined });
    const { result } = renderHook(() => useClipboard());

    let success: boolean = true;
    await act(async () => {
      success = await result.current.copy('test text');
    });

    expect(success).toBe(false);
    expect(result.current.copied).toBe(false);
  });

  it('reset 함수를 호출하면 copied가 즉시 false로 초기화', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
  });

  it('다른 timeout 옵션을 설정할 수 있음', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard({ timeout: 3000 }));

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.copied).toBe(true);

    // 2초 경과 (아직 유지)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(true);

    // 추가 1초 경과 (총 3초, 초기화됨)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
  });
});
