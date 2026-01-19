'use client';

import { useQRCode } from '@/hooks/useQRCode';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import Image from 'next/image';

export interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
}

/**
 * QR 코드 생성 및 공유 컴포넌트
 */
export function QRCodeGenerator({
  url,
  title = 'QR 코드',
  size = 256,
  className = '',
}: QRCodeGeneratorProps) {
  const { qrCodeDataUrl, isGenerating, error, downloadQRCode, copyToClipboard } = useQRCode({
    url,
    size,
  });

  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDownload = () => {
    const filename = `qrcode-${Date.now()}.png`;
    downloadQRCode(filename);
  };

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <p className="text-sm text-red-600">QR 코드 생성 실패: {error.message}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* QR 코드 표시 */}
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        {isGenerating ? (
          <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">QR 코드 생성 중...</p>
          </div>
        ) : qrCodeDataUrl ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <Image
              src={qrCodeDataUrl}
              alt="QR Code"
              width={size}
              height={size}
              className="h-auto w-full"
              style={{ maxWidth: `${size}px` }}
              unoptimized
            />
          </div>
        ) : null}
      </div>

      {/* URL 표시 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="break-all text-sm text-gray-600">{url}</p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleCopyUrl}
          variant="secondary"
          className="flex-1"
          disabled={isGenerating}
        >
          {copied ? '복사됨!' : 'URL 복사'}
        </Button>

        <Button
          onClick={handleDownload}
          variant="primary"
          className="flex-1"
          disabled={isGenerating || !qrCodeDataUrl}
        >
          PNG 다운로드
        </Button>
      </div>
    </div>
  );
}
