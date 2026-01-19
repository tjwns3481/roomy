# MSW (Mock Service Worker) Setup

## 개요

MSW를 사용한 프론트엔드 API Mock 설정입니다. API 계약(Contract)을 기반으로 실제 백엔드 없이도 독립적으로 프론트엔드 개발 및 테스트가 가능합니다.

## 디렉토리 구조

```
src/mocks/
├── browser.ts              # MSW 서비스 워커 브라우저 설정
├── handlers/               # API 핸들러
│   ├── index.ts           # 모든 핸들러 통합
│   ├── users.ts           # 사용자 API Mock (GET/PATCH /api/user, GET /api/users/:id)
│   ├── guides.ts          # 안내서 API Mock (CRUD + publish, check-slug)
│   └── blocks.ts          # 블록 API Mock (CRUD + reorder)
└── data/                  # Mock 데이터
    ├── index.ts           # 모든 데이터 Export
    ├── users.ts           # 샘플 사용자 데이터
    ├── guides.ts          # 샘플 안내서 데이터
    └── blocks.ts          # 샘플 블록 데이터
```

## API 엔드포인트

### 사용자 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/user` | 현재 사용자 정보 조회 |
| PATCH | `/api/user` | 사용자 정보 수정 |
| GET | `/api/user/plan` | 사용자 플랜 정보 조회 |
| GET | `/api/users/:id` | 사용자 공개 프로필 조회 |

### 안내서 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/guides` | 안내서 생성 |
| GET | `/api/guides` | 안내서 목록 조회 (페이지네이션, 필터, 검색) |
| GET | `/api/guides/:id` | 안내서 상세 조회 (블록 포함) |
| PATCH | `/api/guides/:id` | 안내서 수정 |
| DELETE | `/api/guides/:id` | 안내서 삭제 |
| POST | `/api/guides/:id/publish` | 안내서 발행 (slug 설정) |
| POST | `/api/guides/check-slug` | 슬러그 중복 확인 |
| GET | `/api/guides/public/:slug` | Public 안내서 조회 (발행된 안내서만) |

### 블록 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/guides/:guideId/blocks` | 블록 생성 |
| GET | `/api/guides/:guideId/blocks` | 블록 목록 조회 |
| PATCH | `/api/guides/:guideId/blocks/:blockId` | 블록 수정 |
| DELETE | `/api/guides/:guideId/blocks/:blockId` | 블록 삭제 |
| POST | `/api/guides/:guideId/blocks/reorder` | 블록 순서 변경 |

## Setup

### 1. Vitest Setup (자동)

`src/__tests__/setup.ts`에서 MSW가 자동으로 초기화됩니다:

```typescript
import { worker } from '@/mocks/browser'

beforeAll(() => {
  return worker.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  worker.resetHandlers()
})

afterAll(() => {
  return worker.close()
})
```

### 2. 개발 환경 (필요시)

Next.js 개발 환경에서 MSW를 사용하려면 `src/app/providers.tsx`에 다음을 추가할 수 있습니다:

```typescript
'use client'

import { useEffect } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.listen({ onUnhandledRequest: 'warn' })
      })
    }
  }, [])

  return children
}
```

## Mock 데이터

### 현재 로그인 사용자

```typescript
import { MOCK_CURRENT_USER } from '@/mocks/data'

// {
//   id: 'user_test_1',
//   email: 'john.doe@example.com',
//   name: 'John Doe',
//   plan: 'FREE',
//   guideCount: 1,
//   guideLimit: 1,
//   canCreateGuide: true,
// }
```

### 샘플 안내서

```typescript
import { MOCK_GUIDES, MOCK_GUIDE_LIST_ITEMS } from '@/mocks/data'

// guide_test_1: 발행된 안내서 (slug: 'guesthouse-guide')
// guide_test_2: 미발행 안내서
// guide_test_3: 발행된 안내서 (slug: 'beach-pension')
```

### 샘플 블록

```typescript
import { MOCK_BLOCKS } from '@/mocks/data'

// HERO, QUICK_INFO, AMENITIES, NOTICE, GALLERY 등 다양한 블록 타입
```

## 테스트 작성

### API 테스트 예시

```typescript
import { describe, it, expect } from 'vitest'

describe('Guide API', () => {
  it('should fetch guides', async () => {
    const response = await fetch('/api/guides')
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('meta')
  })

  it('should create a guide', async () => {
    const response = await fetch('/api/guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '새 가이드',
        description: '설명',
      }),
    })
    expect(response.status).toBe(201)
  })
})
```

### 핸들러 재정의 (특정 테스트에서)

```typescript
import { worker } from '@/mocks/browser'
import { http, HttpResponse } from 'msw'

beforeEach(() => {
  // 특정 엔드포인트 오버라이드
  worker.use(
    http.get('/api/guides', () => {
      return HttpResponse.json({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })
    })
  )
})
```

## 스키마 검증

모든 Mock 데이터는 계약(Contract) 스키마와 일치하는지 검증됩니다:

- `GuideSchema`: 안내서 기본 정보
- `GuideWithBlocksSchema`: 안내서 + 블록
- `BlockSchema`: 블록 정보
- `UserSchema`: 사용자 정보
- 등등...

테스트: `src/__tests__/mocks/schema-validation.test.ts`

## 오류 응답 처리

모든 Mock 핸들러는 실제 API 오류와 동일한 형식의 응답을 반환합니다:

```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'CONFLICT' | ...,
    message: '에러 메시지',
    details?: [
      { field: 'fieldName', message: '필드 에러' }
    ]
  }
}
```

## 주의사항

### 1. MSW 핸들러 순서

MSW 2.x에서는 **더 구체적인 경로를 먼저 정의**해야 합니다:

```typescript
// ✅ 올바른 순서
[
  http.post('/api/guides/check-slug', ...),  // 구체적
  http.get('/api/guides/public/:slug', ...), // 구체적
  http.post('/api/guides', ...),             // 일반적
  http.get('/api/guides/:id', ...),          // 일반적
]

// ❌ 잘못된 순서
[
  http.get('/api/guides/:id', ...),          // 일반적이면 안됨!
  http.post('/api/guides/check-slug', ...),  // 이 핸들러를 못 찾음
]
```

### 2. 메모리 저장소

Mock 데이터는 메모리에 저장되므로 페이지 새로고침이나 테스트 종료 후 초기 상태로 복구됩니다. 이는 의도적인 설계입니다.

### 3. 타입 안전성

모든 Mock 데이터와 핸들러는 TypeScript로 작성되어 계약 스키마와의 타입 일치를 강제합니다.

## 관련 파일

- **계약**: `src/contracts/*.ts`
- **테스트**: `src/__tests__/mocks/*.test.ts`
- **Vitest 설정**: `vitest.config.ts`
- **Setup**: `src/__tests__/setup.ts`

## 참고

- [MSW 공식 문서](https://mswjs.io/)
- [MSW 2.x 가이드](https://mswjs.io/docs/getting-started)
- 프로젝트 계약: `frontend/src/contracts/`
