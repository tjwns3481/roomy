# 07-coding-convention.md
## 코딩 컨벤션 & 아키텍처

### 개요
Next.js App Router 기반 풀스택 구조. 컴포넌트는 기능별로 조직화하고, 섹션은 버티컬별 플러그인 구조로 관리한다.

---

## 디렉토리 구조

```
roomy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # S1 랜딩
│   │   ├── gallery/
│   │   │   └── page.tsx              # S2 갤러리
│   │   ├── editor/
│   │   │   ├── [templateId]/
│   │   │   │   └── page.tsx          # S4 에디터
│   │   │   └── layout.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx              # S5 결제
│   │   ├── dashboard/
│   │   │   └── page.tsx              # S6 마이페이지
│   │   ├── page/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # S7 뷰어
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── templates/route.ts
│   │       ├── pages/
│   │       │   ├── route.ts          # GET (조회), POST (생성)
│   │       │   └── [id]/route.ts     # PATCH (수정), DELETE (삭제)
│   │       ├── orders/route.ts       # 결제
│   │       ├── guestbook/route.ts    # 방명록
│   │       ├── rsvp/route.ts         # RSVP
│   │       └── page-views/route.ts   # 조회 통계
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── forms/
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── buttons/
│   │   │   ├── Button.tsx            # Primary, Secondary, Ghost, Disabled
│   │   │   ├── IconButton.tsx
│   │   │   └── FloatingButton.tsx
│   │   ├── modals/
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── AuthModal.tsx         # S8 인증 모달
│   │   ├── cards/
│   │   │   ├── TemplateCard.tsx      # S2 갤러리 카드
│   │   │   ├── PageCard.tsx          # S6 마이페이지 카드
│   │   │   └── SectionCard.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── Toast.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SEO.tsx
│   │
│   ├── sections/
│   │   ├── wedding/                  # 청첩장 섹션
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StorySection.tsx
│   │   │   ├── LocationSection.tsx
│   │   │   ├── AccountSection.tsx
│   │   │   ├── RSVPSection.tsx
│   │   │   ├── GuestbookSection.tsx
│   │   │   └── index.ts              # 섹션 레지스트리
│   │   └── guidebook/               # 객실 안내서 섹션
│   │       ├── HeroSection.tsx
│   │       ├── WiFiDoorSection.tsx
│   │       ├── CheckinGuideSection.tsx
│   │       ├── LocationSection.tsx
│   │       ├── HostContactSection.tsx
│   │       └── index.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx
│   │   │   └── services/
│   │   │       └── authService.ts
│   │   ├── editor/
│   │   │   ├── hooks/
│   │   │   │   ├── useEditor.ts
│   │   │   │   ├── useDraftSave.ts
│   │   │   │   └── usePreview.ts
│   │   │   ├── stores/
│   │   │   │   └── editorStore.ts    # Zustand
│   │   │   └── services/
│   │   │       └── editorService.ts
│   │   └── viewer/
│   │       ├── hooks/
│   │       │   ├── useViewer.ts
│   │       │   └── usePageViews.ts
│   │       └── services/
│   │           └── viewerService.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase 클라이언트
│   │   │   ├── admin.ts              # 서버용 Admin 클라이언트
│   │   │   └── rls.ts                # RLS 정책 검증
│   │   ├── payment/
│   │   │   ├── payment.interface.ts  # 인터페이스
│   │   │   ├── mock-provider.ts      # 모크 구현
│   │   │   ├── toss-provider.ts      # 토스 구현 (향후)
│   │   │   └── index.ts              # 팩토리
│   │   ├── utils/
│   │   │   ├── validation.ts         # 입력 검증
│   │   │   ├── formatting.ts         # 포맷팅 (날짜, 통화)
│   │   │   ├── image.ts              # 이미지 최적화
│   │   │   └── crypto.ts             # IP 해싱 등
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useAsync.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── usePrevious.ts
│   │   ├── constants/
│   │   │   ├── colors.ts             # 디자인 시스템 색상
│   │   │   ├── animations.ts         # Framer Motion 프리셋
│   │   │   ├── sizes.ts              # 브레이크포인트, 크기
│   │   │   └── messages.ts           # 오류/성공 메시지
│   │   └── types/
│   │       ├── user.ts
│   │       ├── template.ts
│   │       ├── page.ts
│   │       ├── order.ts
│   │       └── common.ts
│   │
│   ├── styles/
│   │   ├── globals.css               # 전역 스타일
│   │   ├── animations.css            # 추가 애니메이션
│   │   └── tailwind.config.js         # Tailwind 설정
│   │
│   └── middleware.ts                 # 인증 미들웨어
│
├── public/
│   ├── templates/
│   │   ├── wedding/
│   │   │   ├── template-1.jpg
│   │   │   └── ...
│   │   └── guidebook/
│   │       ├── template-1.jpg
│   │       └── ...
│   └── icons/
│       ├── hero.svg
│       ├── location.svg
│       └── ...
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260611000001_init.sql
│   │   ├── 20260611000002_rls.sql
│   │   └── ...
│   └── config.toml
│
├── __tests__/
│   ├── api/
│   ├── components/
│   ├── features/
│   └── lib/
│
├── .env.local                        # 로컬 환경 변수 (커밋 금지)
├── .env.example                      # 템플릿
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 파일 네이밍 & 스타일

### TypeScript

- **컴포넌트**: PascalCase (예: `Button.tsx`, `TemplateCard.tsx`)
- **훅**: camelCase with `use` prefix (예: `useAuth.ts`, `useDraftSave.ts`)
- **유틸리티**: camelCase (예: `validation.ts`, `formatting.ts`)
- **타입**: PascalCase (예: `User.ts`, `Template.ts`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_FILE_SIZE`, `API_BASE_URL`)

### CSS/Tailwind

- **클래스명**: kebab-case (예: `btn-primary`, `form-input`)
- **CSS 변수**: --kebab-case (예: `--color-primary`, `--spacing-lg`)

### 예시

```typescript
// ✓ Good
export const Button: React.FC<ButtonProps> = ({ variant, ...props }) => {
  return <button className={`btn btn-${variant}`} {...props} />;
};

// ✗ Bad
export const button = ({ variant, ...props }) => {
  return <button className={`btn btn${variant}`} {...props} />;
};
```

---

## 컴포넌트 구조

### 기본 컴포넌트 (Atomic)

```typescript
// Button.tsx
import { motion } from 'framer-motion';
import { animations } from '@/lib/constants';

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  children,
  onClick,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-neutral-50 text-neutral-900 border border-neutral-200',
    ghost: 'bg-transparent text-primary-500 border border-primary-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={animations.quick}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        font-semibold rounded-lg transition-all
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      {...props}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </motion.button>
  );
};
```

### 컴포지트 컴포넌트 (Organisms)

```typescript
// AuthModal.tsx
import { useState } from 'react';
import { Modal } from '@/components/modals/Modal';
import { Button } from '@/components/buttons/Button';
import { Input } from '@/components/forms/Input';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { login, signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 로직
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">
          {mode === 'login' ? '로그인' : '가입'}
        </h2>
        <Input type="email" placeholder="이메일" />
        <Input type="password" placeholder="비밀번호" />
        <Button type="submit" isLoading={isLoading}>
          {mode === 'login' ? '로그인' : '가입'}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-primary-500 text-sm"
        >
          {mode === 'login' ? '가입하기' : '로그인하기'}
        </button>
      </form>
    </Modal>
  );
};
```

---

## 섹션 플러그인 구조

### 핵심: 버티컬별 섹션 타입 정의

```typescript
// lib/types/section.ts
export type SectionType = 'wedding' | 'guidebook';

export interface BaseSection {
  id: string;
  type: string;
  visible: boolean;
}

export interface WeddingSection extends BaseSection {
  type: 'hero' | 'story' | 'location' | 'account' | 'rsvp' | 'guestbook';
}

export interface GuidebookSection extends BaseSection {
  type: 'hero' | 'wifi_door' | 'checkin' | 'location' | 'contact';
}

export type Section = WeddingSection | GuidebookSection;
```

### 섹션 컴포넌트 인터페이스

```typescript
// sections/Section.interface.ts
export interface SectionComponentProps {
  data: Section;
  isEditable: boolean;
  onUpdate?: (data: Section) => void;
}

export interface SectionEditorProps {
  data: Section;
  onUpdate: (data: Section) => void;
}

export interface SectionViewerProps {
  data: Section;
}
```

### 섹션 구현 예시 (청첩장, Zod 타입 안전성)

```typescript
// sections/wedding/schema.ts
import { z } from 'zod';

export const WeddingHeroSectionSchema = z.object({
  id: z.string(),
  type: z.literal('hero'),
  visible: z.boolean(),
  title: z.string(),
  subtitle: z.string().optional(),
  backgroundImage: z.string().url(),
});

export type WeddingHeroSection = z.infer<typeof WeddingHeroSectionSchema>;

// sections/wedding/HeroSection.tsx
import { motion } from 'framer-motion';
import { SectionViewerProps } from '@/sections/Section.interface';
import { WeddingHeroSection, WeddingHeroSectionSchema } from './schema';

export const HeroSection: React.FC<SectionViewerProps> = ({ data }) => {
  // 런타임 검증 (Zod)
  const parsed = WeddingHeroSectionSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid HeroSection data:', parsed.error);
    return null;
  }

  const { visible, title, subtitle, backgroundImage } = parsed.data;

  if (!visible) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <motion.h1
          className="text-5xl font-black text-white text-center"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-xl text-white text-center mt-4"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
};
```

**주의**: `data as any` 제거 → Zod 스키마 + safeParse로 런타임 검증 필수

### 섹션 에디터

```typescript
// sections/wedding/HeroSectionEditor.tsx
import { Input } from '@/components/forms/Input';
import { FileUpload } from '@/components/forms/FileUpload';
import { SectionEditorProps } from '@/sections/Section.interface';

export const HeroSectionEditor: React.FC<SectionEditorProps> = ({ data, onUpdate }) => {
  const handleTitleChange = (title: string) => {
    onUpdate({ ...data, title });
  };

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file);
    onUpdate({ ...data, backgroundImage: url });
  };

  return (
    <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2">제목</label>
        <Input
          value={data.title || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="신랑·신부 이름"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">배경 이미지</label>
        <FileUpload onUpload={handleImageUpload} />
      </div>
    </div>
  );
};
```

### 섹션 레지스트리 (팩토리)

```typescript
// sections/wedding/index.ts
import { HeroSection } from './HeroSection';
import { HeroSectionEditor } from './HeroSectionEditor';
import { StorySection } from './StorySection';
import { StorySectionEditor } from './StorySectionEditor';
// ... 더 많은 섹션

export const WEDDING_SECTIONS = {
  hero: { viewer: HeroSection, editor: HeroSectionEditor },
  story: { viewer: StorySection, editor: StorySectionEditor },
  location: { viewer: LocationSection, editor: LocationSectionEditor },
  // ...
};

// sections/wedding/SectionFactory.tsx
export const WeddingSectionFactory: React.FC<{ section: WeddingSection; isEditable: boolean }> = ({
  section,
  isEditable,
}) => {
  const SectionComponent = isEditable
    ? WEDDING_SECTIONS[section.type]?.editor
    : WEDDING_SECTIONS[section.type]?.viewer;

  if (!SectionComponent) {
    return <div>Unknown section type: {section.type}</div>;
  }

  return <SectionComponent data={section} {...(isEditable && { onUpdate })} />;
};
```

---

## 상태 관리 (Zustand)

### 에디터 스토어

```typescript
// features/editor/stores/editorStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface EditorState {
  pageId: string | null;
  templateId: string;
  title: string;
  sections: Section[];
  colors: { primary: string; text: string };
  isSaving: boolean;
  lastSaved: Date | null;

  // Actions
  setPageId: (id: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  toggleSection: (sectionId: string) => void;
  updateColor: (key: string, value: string) => void;
  save: () => Promise<void>;
  loadDraft: (templateId: string) => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    pageId: null,
    templateId: '',
    title: '',
    sections: [],
    colors: { primary: '#FF6B6B', text: '#333333' },
    isSaving: false,
    lastSaved: null,

    setPageId: (id) => set({ pageId: id }),

    updateSection: (sectionId, updates) =>
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (section) {
          Object.assign(section, updates);
        }
      }),

    toggleSection: (sectionId) =>
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId);
        if (section) {
          section.visible = !section.visible;
        }
      }),

    updateColor: (key, value) =>
      set((state) => {
        state.colors[key] = value;
      }),

    save: async () => {
      set({ isSaving: true });
      try {
        const state = get();
        await savePageToServer({
          pageId: state.pageId,
          templateId: state.templateId,
          content: {
            sections: state.sections,
            colors: state.colors,
          },
        });
        set({ lastSaved: new Date() });
        // 동시에 localStorage에도 저장
        saveDraftToLocalStorage(state);
      } finally {
        set({ isSaving: false });
      }
    },

    loadDraft: (templateId) => {
      const draft = loadDraftFromLocalStorage(templateId);
      if (draft) {
        set(draft);
      }
    },
  }))
);
```

### 컴포넌트에서 사용

```typescript
// features/editor/Editor.tsx
export const Editor: React.FC<{ templateId: string }> = ({ templateId }) => {
  const {
    title,
    sections,
    colors,
    isSaving,
    updateSection,
    toggleSection,
    updateColor,
    save,
    loadDraft,
  } = useEditorStore();

  useEffect(() => {
    loadDraft(templateId);
  }, [templateId, loadDraft]);

  const handleTitleChange = (value: string) => {
    // Zustand 없이 직접 상태 업데이트 할 때는 이렇게
    useEditorStore.setState({ title: value });
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* 에디터 폼 */}
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목"
        />
        {/* 색상 선택 */}
        <input
          type="color"
          value={colors.primary}
          onChange={(e) => updateColor('primary', e.target.value)}
        />
        {/* 섹션 토글 */}
        {sections.map((section) => (
          <div key={section.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.visible}
              onChange={() => toggleSection(section.id)}
            />
            <span>{section.type}</span>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {/* 미리보기 */}
      </div>
      <button onClick={save} disabled={isSaving}>
        {isSaving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
};
```

---

## 테스트 방침

### 단위 테스트 (Unit Tests)

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/buttons/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Test</Button>);
    const btn = screen.getByText('Test');
    expect(btn).toHaveClass('bg-primary-500');
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### API 테스트

```typescript
// __tests__/api/orders.test.ts
import { POST } from '@/app/api/orders/route';

describe('POST /api/orders', () => {
  it('creates order and returns success', async () => {
    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        page_id: 'uuid-1',
        amount: 29900,
        payment_method: 'mock',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order_id).toBeDefined();
    expect(data.status).toBe('completed');
  });

  it('returns 400 for missing page_id', async () => {
    const request = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: 29900,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### 통합 테스트

```bash
# playwright를 사용한 E2E 테스트
npx playwright test

# 예: 전체 구매 플로우
# S2 갤러리 → S4 에디터 → S5 결제 → URL 발급
```

---

## API 라우트 패턴

### GET 요청

```typescript
// app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vertical = searchParams.get('vertical');

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('vertical', vertical)
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json({
      templates: data,
      total: data.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### POST 요청 (인증 필수)

```typescript
// app/api/pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { template_id, content, title } = body;

    // 검증
    if (!template_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pages')
      .insert({
        user_id: session.user.id,
        template_id,
        title,
        content,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 환경 변수

### .env.example

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 결제
NEXT_PUBLIC_PAYMENT_PROVIDER=mock
TOSS_PAYMENTS_API_KEY=sk_live_...

# 기타
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
```

---

## 성능 최적화

### 번들 분할

```typescript
// Next.js 동적 import
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/features/editor/Editor'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

### 이미지 최적화

```typescript
// next/image 사용
import Image from 'next/image';

export const TemplateCard = ({ thumbnail_url }) => {
  return (
    <Image
      src={thumbnail_url}
      alt="Template"
      width={300}
      height={400}
      priority={false}
      loading="lazy"
      quality={80}
    />
  );
};
```

### 캐싱 전략

```typescript
// 템플릿 갤러리 (1시간 캐시)
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

---

## Error Handling

### Global Error Boundary

```typescript
// app/error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">무언가 잘못되었습니다</h1>
        <p className="text-neutral-600 mb-6">{error.message}</p>
        <button onClick={() => reset()} className="btn btn-primary">
          다시 시도
        </button>
      </div>
    </div>
  );
}
```

---

## Loop Metadata

- **Upstream documents referenced**: 01-prd.md, 03-user-flow.md, 04-database-schema.md, 05-design-system.md, 06-screens.md
- **Downstream documents affected**: None (최종 기술 명세)
- **Open questions**:
  - Zustand 외에 Context API만으로 충분할까?
  - 섹션 플러그인 구조가 과도한가?
  - 에러 로깅 (Sentry, LogRocket) 도입 시점?
  - 타입 생성 자동화 (Supabase 스키마 → TypeScript)?
- **Assumptions**:
  - Next.js 13+ App Router 안정성 신뢰
  - Zustand는 Redux보다 가볍고 충분
  - 섹션 플러그인은 향후 버티컬 추가 시 유용
  - TypeScript strict 모드 사용
  - Zod 런타임 검증으로 stored XSS 최종 방어 계층 확보
- **Validation criteria**:
  - 모든 API 라우트에서 인증 검증 (비로그인은 명시적으로 허용)
  - 섹션 팩토리가 신규 섹션 추가 시 배포 없이 레지스트리 수정으로 확장
  - `data as any` 제거 → 모든 섹션 페이로드 Zod 스키마 + safeParse
  - content schema_version 존재 (마이그레이션 대비)
  - orders status enum에 'expired' 포함
  - 단위 테스트 커버리지 > 80%
  - lighthouse 번들 크기 < 150KB gzip
- **Last reviewed**: council 리뷰 반영(2026-06-11)
