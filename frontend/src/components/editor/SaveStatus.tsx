// @TASK T2.6 - 저장 상태 컴포넌트 구현
// @SPEC docs/planning/02-trd.md#자동저장
// @TEST src/__tests__/components/editor/SaveStatus.test.tsx

'use client'

import { AutoSaveStatus } from '@/hooks/useAutoSave'

interface SaveStatusProps {
  /**
   * 저장 상태
   */
  status: AutoSaveStatus
  /**
   * 변경사항이 있는지 여부
   */
  isDirty?: boolean
  /**
   * 마지막 저장 시간
   */
  lastSavedAt?: Date | null
  /**
   * 에러 메시지
   */
  error?: string | null
  /**
   * 재시도 핸들러
   */
  onRetry?: () => void
}

/**
 * 저장 상태 표시 컴포넌트
 *
 * 에디터의 자동저장 상태를 사용자에게 표시합니다.
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const { status, isDirty, lastSavedAt, error, retry } = useAutoSave({...})
 *
 *   return (
 *     <div>
 *       <SaveStatus
 *         status={status}
 *         isDirty={isDirty}
 *         lastSavedAt={lastSavedAt}
 *         error={error}
 *         onRetry={retry}
 *       />
 *       {/* Editor content *\/}
 *     </div>
 *   )
 * }
 * ```
 */
export function SaveStatus({
  status,
  isDirty,
  lastSavedAt,
  error,
  onRetry,
}: SaveStatusProps) {
  // idle 상태에서 dirty가 아니면 아무것도 표시하지 않음
  if (status === 'idle' && !isDirty) {
    return null
  }

  // Format last saved time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Dirty state indicator */}
      {isDirty && status === 'idle' && (
        <span className="text-amber-600 dark:text-amber-400">
          저장되지 않은 변경사항
        </span>
      )}

      {/* Saving indicator */}
      {status === 'saving' && (
        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          저장 중...
        </span>
      )}

      {/* Saved indicator */}
      {status === 'saved' && (
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          저장됨
          {lastSavedAt && (
            <span className="text-gray-400 dark:text-gray-500">
              ({formatTime(lastSavedAt)})
            </span>
          )}
        </span>
      )}

      {/* Error indicator */}
      {status === 'error' && (
        <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error || '저장 실패'}
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              재시도
            </button>
          )}
        </span>
      )}
    </div>
  )
}
