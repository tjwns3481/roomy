// @TASK T5.1 - Dashboard 페이지 구현
// @SPEC docs/planning/03-frontend-spec.md#대시보드
// @TEST src/__tests__/pages/Dashboard.test.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useGuideList, useCreateGuide } from '@/hooks/useGuide';
import { GuideList } from '@/components/dashboard/GuideList';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';

/**
 * Dashboard Page - 사용자의 안내서 목록 페이지
 *
 * 기능:
 * - 내 안내서 목록 표시
 * - 새 안내서 만들기
 * - 로딩/빈 상태 처리
 */
export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useGuideList({ page: 1, limit: 20 });
  const createGuide = useCreateGuide();

  const handleCreateGuide = () => {
    createGuide.mutate(
      { title: '새 안내서' },
      {
        onSuccess: (response) => {
          router.push(`/editor/${response.data.id}`);
        },
      }
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">내 안내서</h1>
          <Button variant="primary" disabled>
            새 안내서 만들기
          </Button>
        </div>
        <div data-testid="guide-list-skeleton" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  const guides = data?.data || [];
  const isEmpty = guides.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">내 안내서</h1>
        <Button
          variant="primary"
          onClick={handleCreateGuide}
          isLoading={createGuide.isPending}
        >
          새 안내서 만들기
        </Button>
      </div>

      {/* Content */}
      {isEmpty ? (
        <EmptyState onCreateGuide={handleCreateGuide} />
      ) : (
        <GuideList guides={guides} />
      )}
    </div>
  );
}
