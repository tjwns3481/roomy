// @TASK T3.1 - 게스트 페이지 컨텐츠 컴포넌트
// @SPEC docs/planning/02-trd.md#게스트-페이지

'use client';

import { usePublicGuide } from '@/hooks/useGuide';
import { GuideWithBlocks } from '@/contracts';
import { BlockRenderer } from './BlockRenderer';
import { ThemeProvider } from './ThemeProvider';

/**
 * 게스트 페이지 컨텐츠 (테스트 가능)
 */
export function GuestPageContent({ slug }: { slug: string }) {
  const { data, isLoading, isError, error } = usePublicGuide(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">
            {(error as Error)?.message || '안내서를 찾을 수 없습니다'}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">안내서를 찾을 수 없습니다</div>
        </div>
      </div>
    );
  }

  const guide = data.data as GuideWithBlocks;

  return (
    <ThemeProvider theme={guide.theme}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <header className="mb-8">
            {guide.coverImage && (
              <img
                src={guide.coverImage}
                alt={guide.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
            {guide.description && (
              <p className="text-xl text-gray-600">{guide.description}</p>
            )}
          </header>

          {/* 블록 목록 */}
          <main>
            {guide.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
