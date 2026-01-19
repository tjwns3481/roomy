// @TASK T2.4 - MAP 블록 에디터
// @SPEC docs/planning/02-trd.md#블록-타입별-에디터

'use client';

import { useState, useEffect } from 'react';
import type { MapContent } from '@/contracts';

interface MapEditorProps {
  content: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
}

export function MapEditor({ content, onUpdate }: MapEditorProps) {
  const mapContent = content as MapContent;
  const [title, setTitle] = useState(mapContent.title || '위치');
  const [address, setAddress] = useState(mapContent.address || '');
  const [latitude, setLatitude] = useState(mapContent.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(mapContent.longitude?.toString() || '');
  const [zoomLevel, setZoomLevel] = useState(mapContent.zoomLevel || 15);
  const [description, setDescription] = useState(mapContent.description || '');

  useEffect(() => {
    setTitle(mapContent.title || '위치');
    setAddress(mapContent.address || '');
    setLatitude(mapContent.latitude?.toString() || '');
    setLongitude(mapContent.longitude?.toString() || '');
    setZoomLevel(mapContent.zoomLevel || 15);
    setDescription(mapContent.description || '');
  }, [mapContent]);

  const handleUpdate = (updates: Partial<MapContent>) => {
    onUpdate({
      ...mapContent,
      ...updates,
    });
  };

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label htmlFor="map-title" className="block text-sm font-medium text-gray-700 mb-1">
          블록 제목
        </label>
        <input
          id="map-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleUpdate({ title: e.target.value });
          }}
          placeholder="위치"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 주소 */}
      <div>
        <label htmlFor="map-address" className="block text-sm font-medium text-gray-700 mb-1">
          주소
        </label>
        <input
          id="map-address"
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            handleUpdate({ address: e.target.value });
          }}
          placeholder="서울시 강남구 테헤란로 123"
          maxLength={300}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 좌표 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="map-latitude" className="block text-sm font-medium text-gray-700 mb-1">
            위도
          </label>
          <input
            id="map-latitude"
            type="number"
            step="0.000001"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              const lat = parseFloat(e.target.value);
              handleUpdate({ latitude: isNaN(lat) ? null : lat });
            }}
            placeholder="37.5665"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="map-longitude" className="block text-sm font-medium text-gray-700 mb-1">
            경도
          </label>
          <input
            id="map-longitude"
            type="number"
            step="0.000001"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              const lng = parseFloat(e.target.value);
              handleUpdate({ longitude: isNaN(lng) ? null : lng });
            }}
            placeholder="126.9780"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* 줌 레벨 */}
      <div>
        <label htmlFor="map-zoom" className="block text-sm font-medium text-gray-700 mb-1">
          줌 레벨 ({zoomLevel})
        </label>
        <input
          id="map-zoom"
          type="range"
          min="1"
          max="20"
          value={zoomLevel}
          onChange={(e) => {
            const zoom = parseInt(e.target.value);
            setZoomLevel(zoom);
            handleUpdate({ zoomLevel: zoom });
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>확대</span>
          <span>축소</span>
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label htmlFor="map-description" className="block text-sm font-medium text-gray-700 mb-1">
          설명 (선택)
        </label>
        <textarea
          id="map-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            handleUpdate({ description: e.target.value });
          }}
          placeholder="교통편, 주변 정보 등"
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}
