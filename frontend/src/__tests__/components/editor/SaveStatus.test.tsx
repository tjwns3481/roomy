// @TASK T2.6 - 저장 상태 컴포넌트 테스트
// @SPEC docs/planning/02-trd.md#자동저장

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaveStatus } from '@/components/editor/SaveStatus'

describe('SaveStatus', () => {
  describe('상태 표시', () => {
    it('idle 상태일 때 아무것도 표시하지 않음', () => {
      const { container } = render(<SaveStatus status="idle" />)
      expect(container.textContent).toBe('')
    })

    it('saving 상태일 때 "저장 중..." 표시', () => {
      render(<SaveStatus status="saving" />)
      expect(screen.getByText('저장 중...')).toBeInTheDocument()
    })

    it('saved 상태일 때 "저장됨" 표시', () => {
      render(<SaveStatus status="saved" />)
      expect(screen.getByText('저장됨')).toBeInTheDocument()
    })

    it('error 상태일 때 에러 메시지 표시', () => {
      render(<SaveStatus status="error" error="저장 실패" />)
      expect(screen.getByText('저장 실패')).toBeInTheDocument()
    })
  })

  describe('마지막 저장 시간', () => {
    it('lastSavedAt이 있으면 시간 표시', () => {
      const lastSavedAt = new Date('2024-01-15T10:30:00')
      render(<SaveStatus status="saved" lastSavedAt={lastSavedAt} />)

      // 시간 형식이 표시되어야 함 (로케일에 따라 다를 수 있음)
      expect(screen.getByText(/10:30/)).toBeInTheDocument()
    })
  })

  describe('재시도 버튼', () => {
    it('error 상태일 때 재시도 버튼 표시', () => {
      const onRetry = vi.fn()
      render(<SaveStatus status="error" error="저장 실패" onRetry={onRetry} />)

      expect(screen.getByRole('button', { name: '재시도' })).toBeInTheDocument()
    })

    it('재시도 버튼 클릭 시 onRetry 호출', async () => {
      const user = userEvent.setup()
      const onRetry = vi.fn()
      render(<SaveStatus status="error" error="저장 실패" onRetry={onRetry} />)

      await user.click(screen.getByRole('button', { name: '재시도' }))
      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('isDirty 표시', () => {
    it('isDirty가 true일 때 저장되지 않은 변경사항 표시', () => {
      render(<SaveStatus status="idle" isDirty />)
      expect(screen.getByText('저장되지 않은 변경사항')).toBeInTheDocument()
    })
  })
})
