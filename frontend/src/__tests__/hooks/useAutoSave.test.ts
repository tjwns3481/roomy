// @TASK T2.6 - 자동저장 Hook 테스트
// @SPEC docs/planning/02-trd.md#자동저장

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/hooks/useAutoSave'

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('기본 상태', () => {
    it('초기 상태는 idle이어야 함', () => {
      const saveFn = vi.fn()
      const { result } = renderHook(() => useAutoSave({ saveFn, data: null }))

      expect(result.current.status).toBe('idle')
      expect(result.current.isDirty).toBe(false)
      expect(result.current.lastSavedAt).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('isDirty 상태 관리', () => {
    it('데이터가 변경되면 isDirty가 true가 되어야 함', () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 초기 상태
      expect(result.current.isDirty).toBe(false)

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // isDirty가 true로 변경
      expect(result.current.isDirty).toBe(true)
    })

    it('저장이 완료되면 isDirty가 false가 되어야 함', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })
      expect(result.current.isDirty).toBe(true)

      // 디바운스 시간 경과
      await act(async () => {
        vi.advanceTimersByTime(2000)
        // flush promises
        await Promise.resolve()
      })

      expect(saveFn).toHaveBeenCalled()
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('디바운스 저장', () => {
    it('디바운스 시간(2초) 후에 저장되어야 함', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경1' } })

      // 1초 후에는 아직 저장되지 않음
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(saveFn).not.toHaveBeenCalled()

      // 2초 후에 저장됨
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      expect(saveFn).toHaveBeenCalledWith({ title: '변경1' })
    })

    it('연속 변경 시 마지막 변경만 저장되어야 함', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 연속으로 변경
      rerender({ data: { title: '변경1' } })
      act(() => {
        vi.advanceTimersByTime(500)
      })

      rerender({ data: { title: '변경2' } })
      act(() => {
        vi.advanceTimersByTime(500)
      })

      rerender({ data: { title: '변경3' } })

      // 2초 대기
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(saveFn).toHaveBeenCalledTimes(1)
      expect(saveFn).toHaveBeenCalledWith({ title: '변경3' })
    })
  })

  describe('저장 상태 표시', () => {
    it('저장 중일 때 status가 saving이어야 함', async () => {
      let resolveSave: () => void = () => {}
      const saveFn = vi.fn().mockImplementation(
        () => new Promise<void>((resolve) => { resolveSave = resolve })
      )

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // 디바운스 시간 경과
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // 저장 중 상태
      expect(result.current.status).toBe('saving')

      // 저장 완료
      await act(async () => {
        resolveSave()
        await Promise.resolve()
      })

      expect(result.current.status).toBe('saved')
    })

    it('저장 완료 시 lastSavedAt이 업데이트되어야 함', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      expect(result.current.lastSavedAt).toBeNull()

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // 디바운스 시간 경과
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.lastSavedAt).not.toBeNull()
    })
  })

  describe('에러 처리 및 재시도', () => {
    it('저장 실패 시 status가 error가 되어야 함', async () => {
      const error = new Error('저장 실패')
      const saveFn = vi.fn().mockRejectedValue(error)

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000, maxRetries: 1 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // 디바운스 시간 경과
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).toBe('저장 실패')
    })

    it('에러 발생 후 재시도할 수 있어야 함', async () => {
      const saveFn = vi.fn()
        .mockRejectedValueOnce(new Error('저장 실패'))
        .mockResolvedValueOnce(undefined)

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000, maxRetries: 1 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경 (첫 번째 시도 - 실패)
      rerender({ data: { title: '변경됨' } })

      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      expect(result.current.status).toBe('error')

      // 재시도
      await act(async () => {
        await result.current.retry()
      })

      expect(result.current.status).toBe('saved')
    })

    it('자동 재시도가 설정된 횟수만큼 수행되어야 함', async () => {
      const saveFn = vi.fn()
        .mockRejectedValueOnce(new Error('실패1'))
        .mockRejectedValueOnce(new Error('실패2'))
        .mockResolvedValueOnce(undefined)

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAutoSave({ saveFn, data, debounceMs: 2000, maxRetries: 3, retryDelayMs: 1000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // 첫 번째 시도
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      // 첫 번째 재시도
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      // 두 번째 재시도
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      expect(saveFn).toHaveBeenCalledTimes(3)
      expect(result.current.status).toBe('saved')
    })
  })

  describe('수동 저장', () => {
    it('saveNow를 호출하면 즉시 저장되어야 함', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000 }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // 즉시 저장
      await act(async () => {
        await result.current.saveNow()
      })

      expect(saveFn).toHaveBeenCalledWith({ title: '변경됨' })
    })
  })

  describe('비활성화 옵션', () => {
    it('enabled가 false면 자동저장이 비활성화되어야 함', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ saveFn, data, debounceMs: 2000, enabled: false }),
        { initialProps: { data: { title: '초기값' } } }
      )

      // 데이터 변경
      rerender({ data: { title: '변경됨' } })

      // 디바운스 시간 경과
      await act(async () => {
        vi.advanceTimersByTime(2000)
        await Promise.resolve()
      })

      // 저장이 호출되지 않음
      expect(saveFn).not.toHaveBeenCalled()
    })
  })
})
