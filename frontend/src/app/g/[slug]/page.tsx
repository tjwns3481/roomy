// @TASK T3.1 - 게스트 페이지 구현
// @SPEC docs/planning/02-trd.md#게스트-페이지

import { use } from 'react';
import { GuestPageContent } from '@/components/guest/GuestPageContent';

interface GuestPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 게스트 페이지
 * 발행된 안내서를 공개적으로 볼 수 있는 페이지
 */
export default function GuestPage({ params }: GuestPageProps) {
  const { slug } = use(params);
  return <GuestPageContent slug={slug} />;
}
