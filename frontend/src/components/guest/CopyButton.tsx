// @TASK T3.3 - 복사 버튼 컴포넌트
// @SPEC docs/planning/02-trd.md

'use client';

import { useClipboard } from '@/hooks/useClipboard';

export interface CopyButtonProps {
  text: string;
  className?: string;
}

/**
 * 복사 버튼 컴포넌트
 * 클릭 시 텍스트를 클립보드에 복사하고 피드백 표시
 */
export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { copied, copy } = useClipboard({ timeout: 2000 });

  const handleClick = async () => {
    await copy(text);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded transition-colors ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      aria-label="복사"
    >
      {copied ? (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>복사됨!</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>복사</span>
        </>
      )}
    </button>
  );
}
