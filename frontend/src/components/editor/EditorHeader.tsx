'use client';

import { Button } from '@/components/ui/Button';

interface EditorHeaderProps {
  title: string;
  isSaving: boolean;
  onBack: () => void;
  onPublish: () => void;
}

// Simple SVG icons
const ArrowLeft = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const Check = () => (
  <svg className="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Loader = () => (
  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export function EditorHeader({
  title,
  isSaving,
  onBack,
  onPublish,
}: EditorHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Back button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
          aria-label="뒤로 가기"
        >
          <ArrowLeft />
          <span>뒤로</span>
        </Button>

        {/* Center: Title and save status */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            {isSaving ? (
              <>
                <Loader />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Check />
                <span>저장됨</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Publish button */}
        <Button variant="primary" onClick={onPublish}>
          발행
        </Button>
      </div>
    </header>
  );
}
