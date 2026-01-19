// @TASK T5.1 - EmptyState 컴포넌트 구현
// @SPEC docs/planning/03-frontend-spec.md#빈-상태-UI

'use client';

import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  onCreateGuide: () => void;
}

/**
 * EmptyState - 안내서가 없을 때 표시하는 빈 상태 UI
 *
 * 기능:
 * - 안내 메시지 표시
 * - 새 안내서 만들기 CTA
 */
export function EmptyState({ onCreateGuide }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12">
      {/* Icon */}
      <svg
        className="mb-4 h-24 w-24 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>

      {/* Message */}
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        아직 만든 안내서가 없습니다
      </h3>
      <p className="mb-6 max-w-sm text-center text-gray-600">
        첫 번째 안내서를 만들어 보세요. 드래그 앤 드롭으로 쉽게 만들 수 있습니다.
      </p>

      {/* CTA Button */}
      <Button variant="primary" onClick={onCreateGuide}>
        첫 안내서 만들기
      </Button>
    </div>
  );
}
