// @TASK T5.1 - GuideList 컴포넌트 구현
// @SPEC docs/planning/03-frontend-spec.md#안내서-목록-컴포넌트
// @TEST src/__tests__/components/dashboard/GuideList.test.tsx

'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GuideListItem } from '@/contracts';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GuideListProps {
  guides: GuideListItem[];
}

/**
 * GuideList - 안내서 목록 컴포넌트
 *
 * 기능:
 * - 안내서 카드 그리드 표시
 * - 발행 상태 표시
 * - 편집 버튼
 * - 미리보기 링크 (발행된 경우)
 */
export function GuideList({ guides }: GuideListProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/editor/${id}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Card key={guide.id} interactive padding="none" shadow="sm">
          {/* Cover Image */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100">
            {guide.coverImage ? (
              <Image
                src={guide.coverImage}
                alt={guide.title}
                fill
                className="object-cover"
              />
            ) : (
              <div
                data-testid={`guide-${guide.id}-placeholder`}
                className="flex h-full items-center justify-center bg-gradient-to-br from-primary-200 to-accent"
              >
                <svg
                  className="h-16 w-16 text-white opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
              {guide.title}
            </h3>

            {/* Status Badge */}
            <div className="mb-3 flex items-center gap-2">
              {guide.isPublished ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  발행됨
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  작성 중
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{guide.blockCount}개 블록</span>
              <span>{guide.viewCount}회 조회</span>
            </div>
          </CardContent>

          {/* Footer */}
          <CardFooter className="border-t border-gray-100 p-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(guide.id)}
              className="flex-1"
            >
              편집
            </Button>
            {guide.isPublished && guide.slug && (
              <a
                href={`/g/${guide.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="ghost" size="sm" className="w-full">
                  미리보기
                </Button>
              </a>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
