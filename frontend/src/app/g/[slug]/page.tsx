// @TASK T3.1 - 게스트 페이지 구현
// @SPEC docs/planning/02-trd.md#게스트-페이지

import { use } from 'react';
import { Metadata } from 'next';
import { GuestPageContent } from '@/components/guest/GuestPageContent';

interface GuestPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 게스트 페이지 메타데이터 생성
 */
export async function generateMetadata({ params }: GuestPageProps): Promise<Metadata> {
  const { slug } = await params;

  // API에서 안내서 데이터 가져오기
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/guides/public/${slug}`, {
      next: { revalidate: 60 }, // 60초마다 재검증
    });

    if (!response.ok) {
      return {
        title: 'Roomy - 숙소 안내서',
        description: '숙소 이용 안내를 확인하세요',
      };
    }

    const data = await response.json();
    const guide = data.data;

    return {
      title: `${guide.title} - Roomy`,
      description: guide.description || '숙소 이용 안내를 확인하세요',
      openGraph: {
        title: guide.title,
        description: guide.description || '숙소 이용 안내를 확인하세요',
        images: guide.coverImage ? [guide.coverImage] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: guide.title,
        description: guide.description || '숙소 이용 안내를 확인하세요',
        images: guide.coverImage ? [guide.coverImage] : [],
      },
    };
  } catch (error) {
    console.error('Failed to fetch guide for metadata:', error);
    return {
      title: 'Roomy - 숙소 안내서',
      description: '숙소 이용 안내를 확인하세요',
    };
  }
}

/**
 * 게스트 페이지
 * 발행된 안내서를 공개적으로 볼 수 있는 페이지
 */
export default function GuestPage({ params }: GuestPageProps) {
  const { slug } = use(params);
  return <GuestPageContent slug={slug} />;
}
