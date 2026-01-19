import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QRCodeGenerator } from '@/components/common/QRCodeGenerator';
import QRCode from 'qrcode';

// QRCode 라이브러리 모킹
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(),
  },
}));

describe('QRCodeGenerator', () => {
  const mockUrl = 'https://example.com/page/test-slug';
  const mockQRDataUrl = 'data:image/png;base64,mockQRCode';

  test('QR 코드가 생성되고 렌더링된다', async () => {
    (QRCode.toDataURL as any).mockResolvedValue(mockQRDataUrl);

    render(<QRCodeGenerator url={mockUrl} />);

    // QR 코드가 생성될 때까지 대기
    await waitFor(() => {
      const img = screen.getByAltText('QR Code');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockQRDataUrl);
    });

    // URL이 표시됨
    expect(screen.getByText(mockUrl)).toBeInTheDocument();
  });

  test('커스텀 타이틀을 표시한다', async () => {
    (QRCode.toDataURL as any).mockResolvedValue(mockQRDataUrl);

    const title = '페이지 공유하기';
    render(<QRCodeGenerator url={mockUrl} title={title} />);

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  test('QR 코드 생성 중 로딩 상태를 표시한다', async () => {
    (QRCode.toDataURL as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockQRDataUrl), 50))
    );

    render(<QRCodeGenerator url={mockUrl} />);

    // 로딩 메시지 확인
    expect(screen.getByText('QR 코드 생성 중...')).toBeInTheDocument();

    // 생성 완료 후 이미지 확인
    await waitFor(
      () => {
        expect(screen.getByAltText('QR Code')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('QR 코드 생성 실패 시 에러 메시지를 표시한다', async () => {
    const errorMessage = 'QR code generation failed';
    (QRCode.toDataURL as any).mockRejectedValue(new Error(errorMessage));

    render(<QRCodeGenerator url={mockUrl} />);

    await waitFor(() => {
      expect(screen.getByText(/QR 코드 생성 실패/i)).toBeInTheDocument();
    });
  });

  test('QRCode.toDataURL이 올바른 인자로 호출된다', async () => {
    (QRCode.toDataURL as any).mockResolvedValue(mockQRDataUrl);

    render(<QRCodeGenerator url={mockUrl} />);

    await waitFor(() => {
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({
          width: 256,
          margin: 2,
          errorCorrectionLevel: 'M',
        })
      );
    });
  });

  test('커스텀 사이즈를 적용한다', async () => {
    (QRCode.toDataURL as any).mockResolvedValue(mockQRDataUrl);

    const customSize = 512;
    render(<QRCodeGenerator url={mockUrl} size={customSize} />);

    await waitFor(() => {
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({
          width: customSize,
        })
      );
    });
  });
});
