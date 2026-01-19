// @TASK T3.2 - 블록 렌더러 개선
// @SPEC docs/planning/02-trd.md#게스트-페이지

'use client';

import { Block } from '@/contracts';
import { CopyButton } from './CopyButton';

/**
 * 블록 렌더러 (읽기 전용 최적화)
 */
export function BlockRenderer({ block }: { block: Block }) {
  const content = block.content as Record<string, unknown>;

  switch (block.type) {
    case 'HERO':
      return (
        <div className="mb-8">
          {typeof content.imageUrl === 'string' && content.imageUrl && (
            <img
              src={content.imageUrl}
              alt="Hero"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
          {typeof content.title === 'string' && content.title && (
            <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
          )}
          {typeof content.subtitle === 'string' && content.subtitle && (
            <p className="text-lg text-gray-600">{content.subtitle}</p>
          )}
        </div>
      );

    case 'QUICK_INFO':
      const items = (content.items as Array<{ icon: string; label: string; value: string }>) || [];
      return (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-2">{item.label}</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-gray-600">{item.value}</div>
                  <CopyButton text={item.value} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'AMENITIES':
      const amenities = (content.items as Array<{ icon: string; name: string; description?: string }>) || [];
      return (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{(content.title as string) || '편의시설'}</h3>
          <div className="grid grid-cols-2 gap-4">
            {amenities.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span>{item.icon}</span>
                <div>
                  <div className="font-semibold">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'MAP':
      return (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{(content.title as string) || '위치'}</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold mb-2">{content.address as string}</div>
            {typeof content.description === 'string' && content.description && (
              <div className="text-gray-600">{content.description}</div>
            )}
          </div>
        </div>
      );

    case 'GALLERY':
      const images = (content.images as Array<{ id: string; url: string; caption?: string; order: number }>) || [];
      return (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{(content.title as string) || '갤러리'}</h3>
          <div className="grid grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.id}>
                <img
                  src={img.url}
                  alt={img.caption || 'Gallery image'}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {img.caption && (
                  <div className="text-sm text-gray-600 mt-2">{img.caption}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'HOST_PICK':
      const picks = (content.items as Array<{ id: string; category: string; name: string; description: string; imageUrl?: string; address?: string; link?: string }>) || [];
      return (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{(content.title as string) || '호스트 추천'}</h3>
          <div className="space-y-4">
            {picks.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500">{item.category}</div>
                <div className="font-semibold text-lg">{item.name}</div>
                <div className="text-gray-600">{item.description}</div>
                {item.address && (
                  <div className="text-sm text-gray-500 mt-2">{item.address}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'NOTICE':
      const notices = (content.items as Array<{ id: string; icon?: string; text: string }>) || [];
      const variant = content.variant as string || 'info';
      const bgColor = variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';

      return (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{(content.title as string) || '주의사항'}</h3>
          <div className={`p-4 ${bgColor} rounded-lg`}>
            <ul className="space-y-2">
              {notices.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    default:
      return null;
  }
}
