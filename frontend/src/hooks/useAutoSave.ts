// @TASK T2.6 - 자동저장 Hook 구현
// @SPEC docs/planning/02-trd.md#자동저장
// @TEST src/__tests__/hooks/useAutoSave.test.ts

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  /**
   * 저장 함수
   */
  saveFn: (data: T) => Promise<void>
  /**
   * 저장할 데이터
   */
  data: T | null
  /**
   * 디바운스 시간 (ms)
   * @default 2000
   */
  debounceMs?: number
  /**
   * 자동저장 활성화 여부
   * @default true
   */
  enabled?: boolean
  /**
   * 최대 재시도 횟수
   * @default 3
   */
  maxRetries?: number
  /**
   * 재시도 딜레이 (ms)
   * @default 1000
   */
  retryDelayMs?: number
}

interface UseAutoSaveReturn {
  /**
   * 현재 저장 상태
   */
  status: AutoSaveStatus
  /**
   * 변경사항이 있는지 여부
   */
  isDirty: boolean
  /**
   * 마지막 저장 시간
   */
  lastSavedAt: Date | null
  /**
   * 에러 메시지
   */
  error: string | null
  /**
   * 즉시 저장
   */
  saveNow: () => Promise<void>
  /**
   * 재시도
   */
  retry: () => Promise<void>
}

/**
 * 자동저장 Hook
 *
 * 데이터 변경을 감지하고 디바운스된 자동저장을 수행합니다.
 *
 * @example
 * ```tsx
 * function Editor({ guideId }: { guideId: string }) {
 *   const [data, setData] = useState({ title: '' })
 *   const updateGuide = useUpdateGuide()
 *
 *   const { status, isDirty, lastSavedAt, error, saveNow } = useAutoSave({
 *     saveFn: (data) => updateGuide.mutateAsync({ id: guideId, data }),
 *     data,
 *     debounceMs: 2000,
 *   })
 *
 *   return (
 *     <div>
 *       <SaveStatus status={status} lastSavedAt={lastSavedAt} />
 *       <input
 *         value={data.title}
 *         onChange={(e) => setData({ ...data, title: e.target.value })}
 *       />
 *       {isDirty && <button onClick={saveNow}>지금 저장</button>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAutoSave<T>({
  saveFn,
  data,
  debounceMs = 2000,
  enabled = true,
  maxRetries = 3,
  retryDelayMs = 1000,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs for tracking state
  const dataRef = useRef<T | null>(data)
  const initialDataRef = useRef<T | null>(data)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)
  const saveFnRef = useRef(saveFn)

  // Keep saveFn ref updated
  useEffect(() => {
    saveFnRef.current = saveFn
  }, [saveFn])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Core save function
  const performSave = useCallback(async (dataToSave: T): Promise<void> => {
    if (!isMountedRef.current) return

    setStatus('saving')
    setError(null)

    try {
      await saveFnRef.current(dataToSave)

      if (!isMountedRef.current) return

      setStatus('saved')
      setIsDirty(false)
      setLastSavedAt(new Date())
      retryCountRef.current = 0
    } catch (err) {
      if (!isMountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다'

      // Auto-retry if enabled
      if (retryCountRef.current < maxRetries - 1) {
        retryCountRef.current += 1
        setTimeout(() => {
          if (isMountedRef.current) {
            performSave(dataToSave)
          }
        }, retryDelayMs)
      } else {
        setStatus('error')
        setError(errorMessage)
      }
    }
  }, [maxRetries, retryDelayMs])

  // Detect data changes and trigger debounced save
  useEffect(() => {
    // Skip if data is null or this is the initial render
    if (data === null) return

    // Check if data actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(dataRef.current)

    // Update the data ref
    dataRef.current = data

    // If this is the first non-null data, set it as initial
    if (initialDataRef.current === null) {
      initialDataRef.current = data
      return
    }

    // Check if data differs from initial data
    const isDifferentFromInitial =
      JSON.stringify(data) !== JSON.stringify(initialDataRef.current)

    if (hasChanged) {
      setIsDirty(isDifferentFromInitial)

      // Only trigger auto-save if enabled and there are actual changes
      if (enabled && isDifferentFromInitial) {
        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
          if (isMountedRef.current && dataRef.current !== null) {
            performSave(dataRef.current)
          }
        }, debounceMs)
      }
    }
  }, [data, enabled, debounceMs, performSave])

  // Save immediately (bypasses debounce)
  const saveNow = useCallback(async (): Promise<void> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    if (dataRef.current !== null) {
      await performSave(dataRef.current)
    }
  }, [performSave])

  // Retry save after error
  const retry = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0
    if (dataRef.current !== null) {
      await performSave(dataRef.current)
    }
  }, [performSave])

  return {
    status,
    isDirty,
    lastSavedAt,
    error,
    saveNow,
    retry,
  }
}
