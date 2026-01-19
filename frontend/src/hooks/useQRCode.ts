import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

export interface UseQRCodeOptions {
  url: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface UseQRCodeReturn {
  qrCodeDataUrl: string | null;
  isGenerating: boolean;
  error: Error | null;
  generateQRCode: () => Promise<void>;
  downloadQRCode: (filename?: string) => void;
  copyToClipboard: () => Promise<void>;
}

/**
 * QR 코드 생성 및 관리 훅
 */
export function useQRCode({
  url,
  size = 256,
  errorCorrectionLevel = 'M',
}: UseQRCodeOptions): UseQRCodeReturn {
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * QR 코드 생성
   */
  const generateQRCode = useCallback(async () => {
    if (!url) {
      setError(new Error('URL is required'));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        errorCorrectionLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQRCodeDataUrl(dataUrl);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate QR code');
      setError(error);
      setQRCodeDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, [url, size, errorCorrectionLevel]);

  /**
   * QR 코드 다운로드
   */
  const downloadQRCode = useCallback(
    (filename: string = 'qrcode.png') => {
      if (!qrCodeDataUrl) {
        return;
      }

      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [qrCodeDataUrl]
  );

  /**
   * URL 클립보드에 복사
   */
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      throw new Error('Failed to copy URL to clipboard');
    }
  }, [url]);

  /**
   * URL 변경 시 자동으로 QR 코드 재생성
   */
  useEffect(() => {
    if (url) {
      generateQRCode();
    }
  }, [url, generateQRCode]);

  return {
    qrCodeDataUrl,
    isGenerating,
    error,
    generateQRCode,
    downloadQRCode,
    copyToClipboard,
  };
}
