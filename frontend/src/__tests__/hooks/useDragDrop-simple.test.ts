// Simple test for useDragDrop
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDragDrop } from '@/hooks/useDragDrop'
import { useBlockStore } from '@/stores/blockStore'

describe('useDragDrop - Simple', () => {
  beforeEach(() => {
    useBlockStore.getState().reset()
  })

  it('should initialize with empty sortedIds', () => {
    const { result } = renderHook(() => useDragDrop('test-page'))
    expect(result.current.sortedIds).toEqual([])
  })

  it('should have sensors defined', () => {
    const { result } = renderHook(() => useDragDrop('test-page'))
    expect(result.current.sensors).toBeDefined()
    expect(Array.isArray(result.current.sensors)).toBe(true)
  })

  it('should have null activeId initially', () => {
    const { result } = renderHook(() => useDragDrop('test-page'))
    expect(result.current.activeId).toBe(null)
  })
})
