'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const EditorLayout = dynamic(
  () => import('@/components/editor').then((mod) => ({ default: mod.EditorLayout })),
  {
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">에디터 로딩 중...</div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handlePublish = () => {
    // TODO: Implement publish logic
    console.log('Publishing page:', pageId);
  };

  return (
    <EditorLayout
      pageId={pageId}
      title="무제"
      onBack={handleBack}
      onPublish={handlePublish}
    />
  );
}
