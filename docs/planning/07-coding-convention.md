# Coding Convention (코딩 컨벤션)

> Roomy - 에어비앤비 호스트를 위한 디지털 숙소 안내서 플랫폼

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 에어비앤비 호스트가 디지털 안내서를 만들고 공유 |
| 2 | 페르소나 | 부업 호스트 **[가설]** |
| 3 | 핵심 기능 | FEAT-1: 안내서 생성 및 발행 |
| 4 | 성공 지표 (노스스타) | MRR ₩100만 |
| 5 | 입력 지표 | 발행된 안내서 수, 조회수 |
| 6 | 비기능 요구 | 게스트 뷰 < 2초 |
| 7 | Out-of-scope | AI 챗봇 |
| 8 | Top 리스크 | 타겟 미검증 |
| 9 | 완화/실험 | 사용자 조사 먼저 |
| 10 | 다음 단계 | 호스트 인터뷰 |

---

## 1. 프로젝트 구조

### 1.1 디렉토리 구조

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 라우트 그룹
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (guest)/           # 게스트 뷰 (비로그인)
│   │   │   └── g/[slug]/
│   │   ├── (protected)/       # 로그인 필요 라우트
│   │   │   ├── dashboard/
│   │   │   ├── editor/[id]/
│   │   │   └── settings/
│   │   ├── api/               # API Routes (Hono)
│   │   │   └── [[...route]]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/            # UI 컴포넌트
│   │   ├── ui/               # 기본 UI (Button, Input, Card)
│   │   ├── blocks/           # 블록 에디터 컴포넌트
│   │   ├── editor/           # 에디터 전용 컴포넌트
│   │   ├── guest/            # 게스트 뷰 컴포넌트
│   │   ├── dashboard/        # 대시보드 컴포넌트
│   │   └── common/           # 공통 컴포넌트
│   │
│   ├── hooks/                # Custom Hooks
│   │   ├── useGuide.ts
│   │   ├── useAutoSave.ts
│   │   └── index.ts
│   │
│   ├── stores/               # Zustand Stores
│   │   ├── editor.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   │
│   ├── contracts/            # Contract-First 타입 정의
│   │   ├── guide.contract.ts
│   │   ├── block.contract.ts
│   │   └── index.ts
│   │
│   ├── lib/                  # 유틸리티
│   │   ├── api/             # API 클라이언트
│   │   ├── server/          # 서버 전용 (prisma, supabase)
│   │   └── utils/           # 순수 함수
│   │
│   ├── mocks/               # MSW 목업
│   │   ├── handlers/
│   │   └── data/
│   │
│   └── __tests__/           # 테스트 파일
│       ├── components/
│       ├── hooks/
│       └── contracts/
│
├── prisma/
│   └── schema.prisma
│
├── public/
├── e2e/                      # Playwright E2E 테스트
└── package.json
```

### 1.2 파일 명명 규칙

| 유형 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 | PascalCase | `Button.tsx`, `GuideCard.tsx` |
| 훅 | camelCase, use 접두사 | `useGuide.ts`, `useAutoSave.ts` |
| 스토어 | camelCase | `editor.ts`, `auth.ts` |
| 유틸리티 | camelCase | `cn.ts`, `formatDate.ts` |
| Contract | camelCase, .contract 접미사 | `guide.contract.ts` |
| 테스트 | 원본명.test | `Button.test.tsx` |
| 타입 | PascalCase | `Guide`, `Block`, `User` |

---

## 2. TypeScript 규칙

### 2.1 타입 정의

```typescript
// ✅ 좋음: interface 사용 (확장 가능)
interface Guide {
  id: string;
  title: string;
  slug: string;
  blocks: Block[];
}

// ✅ 좋음: type alias (유니온, 프리미티브)
type BlockType = 'text' | 'image' | 'copy' | 'divider';
type GuideId = string;

// ❌ 나쁨: any 사용
const data: any = response;

// ✅ 좋음: unknown + type guard
const data: unknown = response;
if (isGuide(data)) {
  // data는 Guide 타입
}
```

### 2.2 함수 타입

```typescript
// ✅ 좋음: 명시적 반환 타입
function createGuide(title: string): Promise<Guide> {
  // ...
}

// ✅ 좋음: 화살표 함수 + 제네릭
const fetchData = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  return res.json();
};

// ❌ 나쁨: 반환 타입 생략 (복잡한 함수)
async function processData(input) {
  // ...
}
```

### 2.3 Null 처리

```typescript
// ✅ 좋음: Optional chaining
const title = guide?.title ?? 'Untitled';

// ✅ 좋음: 명시적 null 체크
if (guide === null) {
  return <NotFound />;
}

// ❌ 나쁨: 암시적 falsy 체크 (빈 문자열 문제)
if (!guide.title) {
  // '' 도 여기에 해당
}

// ✅ 좋음: 명시적 빈 문자열 체크
if (guide.title === '' || guide.title === null) {
  // ...
}
```

### 2.4 Import/Export

```typescript
// ✅ 좋음: Named export (일관성)
export function Button() {}
export function Card() {}

// ✅ 좋음: barrel export (index.ts)
// components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';

// ❌ 나쁨: default export (리팩토링 어려움)
export default function Button() {}

// 예외: Next.js 페이지/레이아웃은 default export 필수
export default function Page() {}
```

---

## 3. React 규칙

### 3.1 컴포넌트 구조

```typescript
// components/ui/Button.tsx

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

// 1. 타입 정의
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// 2. 컴포넌트 (forwardRef 사용)
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          // variant styles
          variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover',
          variant === 'secondary' && 'border border-border hover:bg-surface-hover',
          // size styles
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'md' && 'h-10 px-4 text-base',
          size === 'lg' && 'h-12 px-6 text-lg',
          // disabled
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 3.2 훅 사용 규칙

```typescript
// ✅ 좋음: 커스텀 훅으로 로직 추출
function useGuide(id: string) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGuide(id)
      .then(setGuide)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [id]);

  return { guide, isLoading, error };
}

// ❌ 나쁨: 컴포넌트 내에서 복잡한 로직
function GuideEditor({ id }: { id: string }) {
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // ... 100줄의 로직
}
```

### 3.3 이벤트 핸들러

```typescript
// ✅ 좋음: handle 접두사
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  // ...
};

const handleBlockDrop = (result: DropResult) => {
  // ...
};

// ❌ 나쁨: on 접두사 (props 전달용)
const onSubmit = () => {}; // props로 받을 때만 on 사용

// ✅ 좋음: Props로 전달
<Form onSubmit={handleSubmit} />
```

### 3.4 조건부 렌더링

```typescript
// ✅ 좋음: 삼항 연산자 (간단한 경우)
{isLoading ? <Spinner /> : <Content />}

// ✅ 좋음: && 연산자 (단일 조건)
{error && <ErrorMessage error={error} />}

// ✅ 좋음: 조기 반환 (복잡한 경우)
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!guide) return <NotFound />;
return <GuideContent guide={guide} />;

// ❌ 나쁨: 중첩된 삼항 연산자
{isLoading ? <Spinner /> : error ? <Error /> : guide ? <Content /> : <Empty />}
```

---

## 4. 상태 관리 (Zustand)

### 4.1 스토어 구조

```typescript
// stores/editor.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Guide, Block } from '@/contracts';

interface EditorState {
  // State
  guide: Guide | null;
  selectedBlockId: string | null;
  isDirty: boolean;

  // Actions
  setGuide: (guide: Guide) => void;
  updateBlock: (blockId: string, content: Partial<Block>) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  selectBlock: (blockId: string | null) => void;
  markClean: () => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    // Initial state
    guide: null,
    selectedBlockId: null,
    isDirty: false,

    // Actions
    setGuide: (guide) =>
      set((state) => {
        state.guide = guide;
        state.isDirty = false;
      }),

    updateBlock: (blockId, content) =>
      set((state) => {
        const block = state.guide?.blocks.find((b) => b.id === blockId);
        if (block) {
          Object.assign(block.content, content);
          state.isDirty = true;
        }
      }),

    reorderBlocks: (fromIndex, toIndex) =>
      set((state) => {
        if (!state.guide) return;
        const blocks = state.guide.blocks;
        const [removed] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, removed);
        // Update order property
        blocks.forEach((block, index) => {
          block.order = index;
        });
        state.isDirty = true;
      }),

    selectBlock: (blockId) =>
      set((state) => {
        state.selectedBlockId = blockId;
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false;
      }),
  }))
);
```

### 4.2 Selector 패턴

```typescript
// ✅ 좋음: 필요한 상태만 선택
const guide = useEditorStore((state) => state.guide);
const isDirty = useEditorStore((state) => state.isDirty);

// ✅ 좋음: 여러 상태를 한 번에 선택 (shallow)
import { shallow } from 'zustand/shallow';

const { guide, selectedBlockId } = useEditorStore(
  (state) => ({
    guide: state.guide,
    selectedBlockId: state.selectedBlockId,
  }),
  shallow
);

// ❌ 나쁨: 전체 스토어 구독
const store = useEditorStore(); // 모든 상태 변경에 리렌더링
```

---

## 5. API & Data Fetching

### 5.1 API Route 구조 (Hono)

```typescript
// app/api/[[...route]]/routes/guide.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { authMiddleware } from '../middleware/auth';

const guideRouter = new Hono()
  // 인증 필요한 라우트
  .use('/*', authMiddleware)

  // GET /api/guides
  .get('/', async (c) => {
    const userId = c.get('userId');
    const guides = await prisma.guide.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return c.json(guides);
  })

  // POST /api/guides
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        title: z.string().min(1).max(200),
      })
    ),
    async (c) => {
      const userId = c.get('userId');
      const { title } = c.req.valid('json');

      const guide = await prisma.guide.create({
        data: {
          userId,
          title,
          slug: generateSlug(title),
        },
      });

      return c.json(guide, 201);
    }
  )

  // GET /api/guides/:id
  .get('/:id', async (c) => {
    const userId = c.get('userId');
    const { id } = c.req.param();

    const guide = await prisma.guide.findFirst({
      where: { id, userId },
      include: { blocks: { orderBy: { order: 'asc' } } },
    });

    if (!guide) {
      return c.json({ error: 'Guide not found' }, 404);
    }

    return c.json(guide);
  });

export { guideRouter };
```

### 5.2 클라이언트 API 호출 (TanStack Query)

```typescript
// hooks/useGuide.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Guide, CreateGuideInput } from '@/contracts';

// Query Keys
export const guideKeys = {
  all: ['guides'] as const,
  lists: () => [...guideKeys.all, 'list'] as const,
  list: (filters: string) => [...guideKeys.lists(), filters] as const,
  details: () => [...guideKeys.all, 'detail'] as const,
  detail: (id: string) => [...guideKeys.details(), id] as const,
};

// Hooks
export function useGuides() {
  return useQuery({
    queryKey: guideKeys.lists(),
    queryFn: () => apiClient.get<Guide[]>('/api/guides'),
  });
}

export function useGuide(id: string) {
  return useQuery({
    queryKey: guideKeys.detail(id),
    queryFn: () => apiClient.get<Guide>(`/api/guides/${id}`),
    enabled: !!id,
  });
}

export function useCreateGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGuideInput) =>
      apiClient.post<Guide>('/api/guides', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guideKeys.lists() });
    },
  });
}
```

---

## 6. Contract-First TDD

### 6.1 Contract 정의

```typescript
// contracts/guide.contract.ts
import { z } from 'zod';

// Schema 정의
export const GuideSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().nullable(),
  coverImageUrl: z.string().url().nullable(),
  theme: z.object({
    primaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }),
  isPublished: z.boolean(),
  viewCount: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateGuideSchema = z.object({
  title: z.string().min(1).max(200),
});

export const UpdateGuideSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }).optional(),
  isPublished: z.boolean().optional(),
});

// Type 추출
export type Guide = z.infer<typeof GuideSchema>;
export type CreateGuideInput = z.infer<typeof CreateGuideSchema>;
export type UpdateGuideInput = z.infer<typeof UpdateGuideSchema>;

// Contract 정의
export const GuideContract = {
  // GET /api/guides
  list: {
    response: z.array(GuideSchema),
  },

  // GET /api/guides/:id
  get: {
    params: z.object({ id: z.string().uuid() }),
    response: GuideSchema,
  },

  // POST /api/guides
  create: {
    body: CreateGuideSchema,
    response: GuideSchema,
  },

  // PATCH /api/guides/:id
  update: {
    params: z.object({ id: z.string().uuid() }),
    body: UpdateGuideSchema,
    response: GuideSchema,
  },

  // DELETE /api/guides/:id
  delete: {
    params: z.object({ id: z.string().uuid() }),
    response: z.object({ success: z.boolean() }),
  },
} as const;
```

### 6.2 Contract 테스트

```typescript
// __tests__/contracts/guide.contract.test.ts
import { describe, it, expect } from 'vitest';
import { GuideSchema, CreateGuideSchema } from '@/contracts/guide.contract';

describe('Guide Contract', () => {
  describe('GuideSchema', () => {
    it('should validate a valid guide', () => {
      const validGuide = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123',
        title: '강릉 바다 숙소',
        slug: 'gangneung-ocean-house',
        description: null,
        coverImageUrl: null,
        theme: {},
        isPublished: false,
        viewCount: 0,
        createdAt: '2026-01-19T00:00:00Z',
        updatedAt: '2026-01-19T00:00:00Z',
      };

      const result = GuideSchema.safeParse(validGuide);
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug', () => {
      const invalidGuide = {
        // ... other fields
        slug: 'Invalid Slug!', // 대문자, 공백, 특수문자
      };

      const result = GuideSchema.safeParse(invalidGuide);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateGuideSchema', () => {
    it('should require title', () => {
      const result = CreateGuideSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = CreateGuideSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('should reject too long title', () => {
      const result = CreateGuideSchema.safeParse({
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });
});
```

---

## 7. 테스트 전략

### 7.1 테스트 피라미드

```
        /\
       /  \      E2E (Playwright)
      /----\     - 핵심 사용자 흐름만
     /      \
    /--------\   Integration
   /          \  - API + DB 통합
  /------------\ - 컴포넌트 + 훅
 /              \
/----------------\ Unit
                   - Contract 검증
                   - 순수 함수
                   - 유틸리티
```

### 7.2 테스트 파일 구조

```typescript
// __tests__/hooks/useGuide.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useGuide } from '@/hooks/useGuide';

// MSW 서버 설정
const server = setupServer(
  http.get('/api/guides/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test Guide',
      // ...
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Wrapper 생성
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useGuide', () => {
  it('should fetch guide by id', async () => {
    const { result } = renderHook(
      () => useGuide('123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.title).toBe('Test Guide');
  });

  it('should handle 404 error', async () => {
    server.use(
      http.get('/api/guides/:id', () => {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      })
    );

    const { result } = renderHook(
      () => useGuide('not-exist'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

### 7.3 E2E 테스트 (Playwright)

```typescript
// e2e/guide-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guide Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태 설정
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new guide', async ({ page }) => {
    // 새 안내서 버튼 클릭
    await page.click('[data-testid="new-guide-button"]');

    // 제목 입력
    await page.fill('[data-testid="guide-title-input"]', '테스트 숙소');

    // 생성 버튼 클릭
    await page.click('[data-testid="create-guide-button"]');

    // 에디터 페이지로 이동 확인
    await expect(page).toHaveURL(/\/editor\/.+/);

    // 제목이 표시되는지 확인
    await expect(page.locator('[data-testid="guide-title"]')).toHaveText('테스트 숙소');
  });

  test('should add a text block', async ({ page }) => {
    // 기존 안내서 열기
    await page.goto('/editor/test-guide-id');

    // 텍스트 블록 추가
    await page.click('[data-testid="add-block-button"]');
    await page.click('[data-testid="block-type-text"]');

    // 텍스트 입력
    await page.fill('[data-testid="text-block-input"]', '환영합니다!');

    // 저장 확인
    await expect(page.locator('[data-testid="save-status"]')).toHaveText('저장됨');
  });
});
```

---

## 8. 에러 처리

### 8.1 에러 타입 정의

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}을(를) 찾을 수 없습니다.`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('로그인이 필요합니다.', 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('접근 권한이 없습니다.', 'FORBIDDEN', 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### 8.2 API 에러 응답

```typescript
// app/api/[[...route]]/middleware/error.ts
import { Context } from 'hono';
import { AppError } from '@/lib/errors';

export function errorHandler(err: Error, c: Context) {
  console.error('[API Error]', err);

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.status
    );
  }

  // 예상치 못한 에러
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    },
    500
  );
}
```

### 8.3 클라이언트 에러 처리

```typescript
// components/common/ErrorBoundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: 에러 리포팅 서비스에 전송
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-xl font-semibold mb-4">문제가 발생했습니다</h2>
          <p className="text-secondary mb-6">
            {this.state.error?.message || '알 수 없는 오류'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            다시 시도
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 9. Git 컨벤션

### 9.1 브랜치 전략

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/FEAT-1-guide-editor
        ├── feature/FEAT-2-guest-view
        ├── fix/block-drag-bug
        └── refactor/api-structure
```

### 9.2 커밋 메시지

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 변경 |
| `style` | 코드 스타일 (포맷팅) |
| `chore` | 빌드, 설정 변경 |
| `perf` | 성능 개선 |

```bash
# 예시
feat(editor): 블록 드래그 앤 드롭 구현

- @dnd-kit 라이브러리 적용
- 블록 순서 변경 시 order 자동 업데이트
- 드래그 중 시각적 피드백 추가

Closes #42
```

### 9.3 PR 템플릿

```markdown
## 변경 사항
<!-- 이 PR에서 변경된 내용을 설명해주세요 -->

## 관련 이슈
<!-- Closes #이슈번호 -->

## 테스트
- [ ] Unit 테스트 추가/수정
- [ ] E2E 테스트 추가/수정
- [ ] 수동 테스트 완료

## 스크린샷
<!-- UI 변경이 있다면 스크린샷을 첨부해주세요 -->

## 체크리스트
- [ ] 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] Contract 테스트 통과
- [ ] 기존 테스트 통과
```

---

## 10. 린팅 & 포맷팅

### 10.1 ESLint 설정

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "react/display-name": "off",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 10.2 Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 10.3 Pre-commit Hook

```json
// package.json (lint-staged)
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Decision Log

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-01-19 | Named export 기본 | 리팩토링 용이, IDE 지원 |
| 2026-01-19 | Zustand + immer | 간단한 상태 관리, 불변성 |
| 2026-01-19 | Contract-First TDD | API 계약 명확화, 타입 안전성 |
| 2026-01-19 | Hono for API | 경량, 타입 안전, Edge 호환 |
