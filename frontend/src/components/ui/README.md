# UI Components

## 개요

Roomy 프로젝트의 기본 UI 컴포넌트 라이브러리입니다.
디자인 시스템(`docs/planning/05-design-system.md`)을 기반으로 구현되었습니다.

## 컴포넌트 목록

### Button

주요 액션을 위한 버튼 컴포넌트입니다.

**Variants:**
- `primary` - 주요 액션 (기본값)
- `secondary` - 보조 액션
- `ghost` - 덜 중요한 액션
- `danger` - 위험한 액션 (삭제 등)

**Sizes:**
- `sm` - 32px height
- `md` - 40px height (기본값)
- `lg` - 48px height

**Props:**
- `variant`: 버튼 스타일
- `size`: 버튼 크기
- `fullWidth`: 전체 너비 여부
- `isLoading`: 로딩 상태

**예시:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  클릭하세요
</Button>

<Button variant="secondary" isLoading>
  로딩 중...
</Button>
```

---

### Input

폼 입력 필드 컴포넌트입니다.

**Props:**
- `label`: 입력 필드 라벨
- `error`: 에러 메시지
- `helperText`: 도움말 텍스트
- `fullWidth`: 전체 너비 여부 (기본값: true)

**접근성:**
- 라벨과 input 자동 연결 (htmlFor/id)
- 에러 메시지 aria-describedby 연결
- aria-invalid 상태 지원

**예시:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="이메일"
  type="email"
  placeholder="email@example.com"
/>

<Input
  label="비밀번호"
  type="password"
  error="비밀번호가 틀렸습니다"
/>

<Input
  label="이름"
  helperText="본명을 입력해주세요"
/>
```

---

### Card

콘텐츠 그룹을 위한 카드 컴포넌트입니다.

**Main Component:**
- `Card`: 카드 컨테이너

**Sub Components:**
- `CardHeader`: 헤더 영역
- `CardTitle`: 제목
- `CardDescription`: 설명
- `CardContent`: 본문
- `CardFooter`: 푸터 (버튼 영역 등)

**Props (Card):**
- `interactive`: 인터랙티브 카드 (hover 효과)
- `padding`: 패딩 크기 (`none`, `sm`, `md`, `lg`)
- `shadow`: 그림자 크기 (`none`, `sm`, `md`, `lg`)

**예시:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
    <CardDescription>카드 설명</CardDescription>
  </CardHeader>
  <CardContent>
    <p>카드 본문 내용입니다.</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">확인</Button>
    <Button variant="secondary">취소</Button>
  </CardFooter>
</Card>

<Card interactive shadow="md">
  <CardTitle>인터랙티브 카드</CardTitle>
  <CardContent className="mt-4">
    <p>hover 효과가 있습니다</p>
  </CardContent>
</Card>
```

---

## 유틸리티

### cn

Tailwind CSS 클래스를 조건부로 병합하는 유틸리티 함수입니다.

**사용법:**
```tsx
import { cn } from '@/lib/utils/cn';

// 기본 사용
<div className={cn('text-base', 'font-bold')} />

// 조건부 클래스
<div className={cn(
  'text-base',
  isActive && 'text-primary',
  isDisabled && 'opacity-50'
)} />

// 외부 클래스 오버라이드
<Button className={cn('custom-class', className)} />
```

---

## 디자인 토큰

### 색상

```css
primary: #E07A5F (Terracotta)
secondary: #3D405B (Navy)
accent: #81B29A (Sage)
sand: #F4F1DE (Cream)

success: #81B29A
warning: #F2CC8F
error: #E07A5F
```

### 폰트

```css
font-family: Pretendard
font-weight: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
```

### 간격

```css
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-6: 24px
space-8: 32px
```

---

## 개발 가이드

### 새 컴포넌트 추가

1. `src/components/ui/ComponentName.tsx` 파일 생성
2. 디자인 시스템 참조하여 구현
3. `@TASK`, `@SPEC` 주석 추가
4. `forwardRef` 사용 (DOM 접근 허용)
5. `index.ts`에 export 추가
6. TypeScript 타입 체크: `npx tsc --noEmit`

### 스타일 가이드

- Tailwind CSS 유틸리티 클래스 사용
- `cn()` 함수로 조건부 클래스 병합
- `forwardRef`로 ref 전달 지원
- ARIA 속성으로 접근성 보장
- 일관된 네이밍: `is`, `has`, `show` prefix

---

## 테스트

데모 페이지: `src/components/ui/__demo__.tsx`

```bash
# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# 빌드 테스트
npm run build
```

---

## 참고

- 디자인 시스템: `docs/planning/05-design-system.md`
- TailwindCSS 설정: `tailwind.config.ts`
- 태스크: T0.4 - 기본 UI 컴포넌트 설정
