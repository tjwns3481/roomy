'use client';

import { useRouter } from 'next/navigation';
import { EditorLayout } from '@/components/editor';
import { useParams } from 'next/navigation';

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
