// @TASK T3.3 - 복사 기능 훅
// @SPEC docs/planning/02-trd.md

import { useState, useCallback } from 'react';

export interface UseClipboardOptions {
  timeout?: number; // "복사됨!" 피드백 지속 시간 (ms)
}

export interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * 클립보드 복사 훅
 *
 * @example
 * ```tsx
 * const { copied, copy } = useClipboard();
 *
 * <button onClick={() => copy('복사할 텍스트')}>
 *   {copied ? '복사됨!' : '복사'}
 * </button>
 * ```
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, timeout);

      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      setCopied(false);
      return false;
    }
  }, [timeout]);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copied, copy, reset };
}
