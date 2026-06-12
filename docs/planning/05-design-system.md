# 05-design-system.md
## 디자인 시스템

### 설계 원칙: 감성 + 부드러운 사용감

Roomy는 "기능이 부족해도 감성과 디자인이 좋으면 선택받는다"는 가설로 시작했다. 따라서 모든 디자인 결정은 다음을 중심으로 한다:

1. **따뜻한 감성**: 안심, 신뢰, 프리미엄감
2. **절제된 화이트스페이스**: 숨 쉬는 여백
3. **Toss급 부드러운 모션**: 스프링 애니메이션, 터치 피드백
4. **마이크로 인터랙션**: 버튼 누름, 스크롤, 로딩 등 모든 순간의 피드백

---

## 무드 & 톤

### 색감
**주 팔레트: 따뜻한 톤 + 중성색**

- **Primary 컬러** (강조, CTA 버튼) — WCAG 2.1 AA 대비 4.5:1 준수
  - `#E03131` (더 어두운 빨강, 흰 텍스트와 대비 4.5:1 이상)
  - 대체안: `#B91C1C` (더 진한 빨강, 대비 5+)
  - 사용처: "만들기", "결제하기", "제출" 버튼
  - 주의: 기존 `#FF6B6B` (밝은 빨강)는 대비 약 2.7:1 미달 → 배경 어둡게 또는 글씨 진하게 조정 필수
  
- **Secondary 컬러** (배경, 아코센트)
  - `#FFE5E5` (매우 옅은 핑크, 배경)
  - `#FFF5F0` (매우 옅은 주황, 섹션 배경)
  - 사용처: 카드 배경, 섹션 분리
  
- **Neutral**
  - `#333333` (거의 검정, 본문 텍스트)
  - `#666666` (진한 회색, 보조 텍스트)
  - `#CCCCCC` (밝은 회색, 구분선)
  - `#F8F8F8` (거의 흰색, 배경)
  
- **Feedback**
  - Success: `#4CAF50` (초록)
  - Error: `#FF5252` (밝은 빨강)
  - Warning: `#FFC107` (노랑)
  - Info: `#2196F3` (파랑)

### 예시 조합
```
랜딩 페이지
- 배경: #FFFFFF (순백)
- 큰 제목: #333333
- CTA 버튼: #FF6B6B

갤러리
- 템플릿 카드 배경: #FFF5F0
- 호버 시 그림자: rgba(51, 51, 51, 0.1)

에디터
- 입력 필드 배경: #F8F8F8
- 보더: #CCCCCC
- 포커스 시 보더: #FF6B6B
```

---

## 타이포그래피

### 폰트 선택

**디스플레이 (제목, 큰 텍스트)**
- 한글: Noto Serif KR (세리프, 고급감)
  - Regular (400): 기본
  - Bold (700): 강조
  - ExtraBlack (900): 히어로 제목
- 영문: Playfair Display (세리프, 우아함)

**본문 (일반 텍스트)**
- 한글: Pretendard (산세리프, 읽기 편함)
  - Regular (400): 기본
  - SemiBold (600): 강조
- 영문: Inter (산세리프, 현대감)

### 타이포그래피 스케일

| 용도 | 사이즈 | 라인높이 | 폰트 | 예시 |
|-----|-------|--------|------|------|
| H1 히어로 제목 | 48px | 1.2 | Noto Serif KR 900 | "신랑·신부" |
| H2 섹션 제목 | 32px | 1.3 | Noto Serif KR 700 | "오시는 길" |
| H3 카드 제목 | 24px | 1.4 | Noto Serif KR 600 | "템플릿 이름" |
| Body 본문 | 16px | 1.6 | Pretendard 400 | 일반 문단 |
| Body Small | 14px | 1.5 | Pretendard 400 | 작은 텍스트 |
| Caption | 12px | 1.4 | Pretendard 500 | 라벨, 설명 |
| Button | 16px | 1.5 | Pretendard 600 | 버튼 텍스트 |

### 타이포그래피 적용 예시

```html
<!-- H1 히어로 제목 -->
<h1 class="text-5xl font-black leading-tight text-neutral-900">
  신랑·신부
</h1>

<!-- Body 본문 -->
<p class="text-base font-normal leading-relaxed text-neutral-600">
  2026년 6월 20일 토요일 오후 2시
</p>

<!-- Button -->
<button class="px-6 py-3 text-base font-semibold bg-primary-500 text-white rounded-lg">
  참석 여부 답하기
</button>
```

---

## 모션 & 애니메이션

### 설계 원칙: Toss급 부드러움

모든 애니메이션은 "느껴지는 무게감"을 표현한다.
- 버튼은 누를 때 약간 축소됨 (액션의 반응)
- 섹션은 스크롤로 등장할 때 아래에서 위로 슬라이드 (자연스러운 진입)
- 로딩 인디케이터는 부드러운 회전 (기다림의 위안)

### 프리셋: Spring Animation

```typescript
// Framer Motion Spring 설정
export const spring = {
  type: "spring",
  stiffness: 200,      // 탄성 (200 = 중간, 매우 부드러움)
  damping: 20,         // 감쇠 (20 = 자연스러움)
  mass: 1
};

// 용도별 프리셋
export const animations = {
  // 빠른 반응 (버튼)
  quick: {
    type: "spring",
    stiffness: 300,
    damping: 25
  },
  
  // 보통 속도 (섹션)
  normal: {
    type: "spring",
    stiffness: 200,
    damping: 20
  },
  
  // 느린 속도 (히어로)
  slow: {
    type: "spring",
    stiffness: 100,
    damping: 20
  }
};
```

### 애니메이션 카테고리

#### 1. 버튼 피드백 (Tap Animation)
```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={animations.quick}
  className="bg-primary-500 text-white px-6 py-3"
>
  클릭하세요
</motion.button>
```
- **기간**: 100ms
- **효과**: 누르면 95%로 축소, 떨어지면 복원

#### 2. 섹션 등장 (Scroll Trigger)
```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={animations.normal}
  viewport={{ once: true, margin: "-100px" }}
>
  오시는 길
</motion.div>
```
- **기간**: 400ms
- **효과**: 아래에서 30px 위로 슬라이드하며 페이드인
- **트리거**: 섹션이 뷰포트에 진입할 때

#### 3. 페이드 인/아웃 (Transition)
```typescript
<motion.div
  animate={{ opacity: isVisible ? 1 : 0 }}
  transition={{ duration: 0.3 }}
>
  내용
</motion.div>
```
- **기간**: 300ms
- **효과**: 보이기/숨기기

#### 4. 로딩 스피너
```typescript
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 1.5,
    ease: "linear"
  }}
  className="h-8 w-8 border-4 border-primary-200 border-t-primary-500 rounded-full"
/>
```
- **기간**: 1.5초
- **효과**: 무한 회전

#### 5. 스크롤 기반 히어로 패럴렉스 (선택사항)
```typescript
const y = useViewportScroll().scrollY;
const parallaxY = useMotionValue(0);

useEffect(() => {
  return y.onChange(v => parallaxY.set(v * 0.5));
}, [y, parallaxY]);

<motion.div style={{ y: parallaxY }}>
  <img src="hero.jpg" alt="배경" />
</motion.div>
```
- **기간**: 스크롤과 함께 (항상 반응)
- **효과**: 배경이 스크롤보다 느리게 움직임

### 모션 감소 지원
```typescript
// 전역 useReducedMotion 가드 (필수)
export const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
};

// 애니메이션 적용 시
const prefersReduced = useReducedMotion();
<motion.div
  animate={prefersReduced ? {} : { opacity: 1 }}
  transition={prefersReduced ? {} : { duration: 0.3 }}
>
  Content
</motion.div>
```

### FPS 목표
- 모든 애니메이션은 **60fps** 유지
- GPU 가속만 사용: `transform`, `opacity` (layout shift 금지)
- `will-change: transform`으로 최적화

---

## 컴포넌트 인벤토리

### 레이아웃 컴포넌트

| 컴포넌트 | 사용처 | 속성 |
|---------|-------|------|
| **Container** | 페이지 최상위 래퍼 | max-width: 480px (모바일) / 1200px (데스크톱) |
| **Section** | 내용 영역 분리 | padding: 40px 20px, margin-bottom: 60px |
| **Card** | 템플릿 카드, 항목 | border-radius: 12px, box-shadow: 0 2px 8px rgba(...) |
| **Grid** | 템플릿 갤러리 | grid-cols: 2 (모바일) / 3 (데스크톱) |

### 폼 컴포넌트

| 컴포넌트 | 상태 | 스타일 |
|---------|------|--------|
| **Input** | 기본/포커스/오류 | background: #F8F8F8, border: 1px #CCC, focus: border #E03131 |
| **Textarea** | 기본/포커스 | min-height: 120px, resize: none |
| **Select** | 열림/닫힘 | 커스텀 드롭다운 (native select 아님) |
| **Checkbox** | 체크됨/체크 안 됨 | 크기: 20px × 20px, 색상: #E03131 |
| **Radio** | 선택됨/선택 안 됨 | 크기: 20px × 20px, 색상: #E03131 |

### 버튼 컴포넌트

| 버튼 종류 | 배경 | 텍스트 | 보더 | 사용처 |
|---------|-----|--------|------|--------|
| **Primary** | #E03131 (또는 #B91C1C) | 흰색 | 없음 | CTA ("만들기", "결제하기") — WCAG AA 대비 4.5:1 |
| **Secondary** | #F8F8F8 | #333 | 1px #CCC | 보조 액션 ("취소", "뒤로") |
| **Ghost** | 투명 | #E03131 | 1px #E03131 | 텍스트 링크 스타일 |
| **Disabled** | #CCCCCC | #999 | 없음 | 비활성화 상태 |

### 모달 & 다이얼로그

```
구조:
- 배경: 투명 검은색 (rgba(0, 0, 0, 0.5))
- 모달 박스: 흰색 배경, border-radius: 16px
- 애니메이션: scale(0.9) → scale(1) (100ms)
- Z-index: 9999

예시: 결제 시점 가입 모달
- 제목: "계정이 필요합니다"
- 본문: "이메일 또는 카카오로 가입하세요"
- 버튼: 이메일 가입 (Primary) / 카카오 가입 (Secondary)
```

---

## 상태 표시 (States)

### 토스트 메시지 (최소 4초 + aria-live=polite)
```typescript
export const Toast: React.FC<{ message: string; duration?: number }> = ({ 
  message, 
  duration = 4000 
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 left-4 bg-primary-500 text-white px-4 py-3 rounded-lg"
    >
      {message}
    </div>
  );
};
```

### 로딩 상태
```
- 로딩 스피너 (회전하는 원, prefers-reduced-motion 존중)
- 텍스트: "잠깐 기다려주세요..."
- 배경 페이드 (약간 어둡게)
```

### 빈 상태 (Empty State)
```
- 큰 아이콘 (예: 빈 문서)
- 텍스트: "아직 페이지가 없습니다"
- 서브텍스트: "템플릿을 선택해서 만들어보세요"
- CTA: "지금 만들기" (버튼)
```

### 오류 상태 (Error State)
```
- 배경색: 매우 옅은 빨강 (#FFE5E5)
- 아이콘: ⚠️ 또는 ✗
- 텍스트: "무언가 잘못되었습니다"
- 재시도 버튼 (Primary)
```

### 성공 상태 (Success State)
```
- 배경색: 매우 옅은 녹색 (#E8F5E9)
- 아이콘: ✓
- 텍스트: "성공했습니다!"
- 다음 액션 버튼 (Primary)
```

---

## 반응형 디자인

### 브레이크포인트

```
Mobile: 0px ~ 639px
Tablet: 640px ~ 1023px
Desktop: 1024px+
```

### 모바일 우선 원칙

모든 기본 스타일은 모바일(320px)을 기준으로 작성하고, 필요하면 태블릿/데스크톱용 오버라이드:

```css
/* 모바일 (기본) */
.section {
  padding: 20px;
  font-size: 16px;
}

/* 태블릿 */
@media (min-width: 640px) {
  .section {
    padding: 40px;
    font-size: 18px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .section {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 접근성 (A11y)

### 색상 대비
- Primary CTA 버튼: 배경 #E03131, 글씨 흰색 = **4.5:1 이상 준수** (WCAG 2.1 AA)
- 본문 텍스트: `#333333` on `#FFFFFF` = 12.6:1 ✓
- 반드시 컬러만으로 정보 표시 금지 (다른 시각적 단서 병행)

### 포커스 상태
- 모든 대화형 요소에 명확한 포커스 표시
- 기본값: 2px solid #E03131 (Primary 색상)

### 텍스트 대체
- 모든 이미지에 alt 속성
- 아이콘에 aria-label

### 키보드 네비게이션
- Tab으로 모든 버튼에 도달 가능
- Enter로 활성화

### 모션 감소
- `prefers-reduced-motion: reduce` 존중 (전역 가드 필수)
- 무한 애니메이션은 일시 정지 버튼 제공

### 토스트 알림
- `aria-live="polite"` + `aria-atomic="true"` 속성
- 최소 4초 표시 (접근성 표준)

---

## 색상 정의 (Tailwind 통합)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          500: '#FF6B6B',
          600: '#FF5252',
          700: '#FF3333',
        },
        neutral: {
          50: '#F8F8F8',
          100: '#F0F0F0',
          600: '#666666',
          900: '#333333',
        },
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'Playfair Display', 'serif'],
        sans: ['Pretendard', 'Inter', 'sans-serif'],
      },
    },
  },
};
```

---

## 마이크로 인터랙션 예시

### 1. 에디터 섹션 토글
```
사용자가 "방명록" on-off 체크박스 클릭
  ↓
체크박스 자신: tap animation (scale 0.9 → 1)
  ↓
방명록 섹션: fade out (opacity 1 → 0, 300ms)
  ↓
프리뷰 우측 자동 갱신 (실시간)
  ↓
피드백: 토스트 메시지 "방명록이 숨겨졌습니다"
```

### 2. 결제 버튼 로딩
```
사용자가 "결제하기" 버튼 클릭
  ↓
버튼 상태: "결제 중..." + 로딩 스피너
  ↓
버튼 비활성화 (클릭 불가)
  ↓
1~3초 후 성공 또는 오류 상태로 전환
```

### 3. 방명록 추가
```
사용자가 댓글 "제출" 클릭
  ↓
입력 필드 비활성화 + 로딩
  ↓
서버 저장 완료
  ↓
댓글 목록 상단에 새 댓글 등장 (scale 0.9 → 1, 200ms)
  ↓
입력 필드 초기화 + 활성화
  ↓
감사 토스트: "댓글이 저장되었습니다"
```

---

## Loop Metadata

- **Upstream documents referenced**: 01-prd.md (감성 + 디자인 1순위 원칙)
- **Downstream documents affected**: 06-screens.md, 07-coding-convention.md
- **Open questions**:
  - 다크 모드 지원할까? (현재는 라이트 모드만)
  - 프린트 스타일 필요할까? (청첩장 인쇄 고객)
  - 상단/하단 네비게이션 고정 바 필요할까?
  - 커스텀 폰트 로딩 성능 최적화 전략?
- **Assumptions**:
  - Noto Serif KR과 Pretendard는 무료이고 빠르게 로딩된다
  - Framer Motion은 충분히 가볍다 (번들 크기 < 20KB gzip)
  - 60fps 애니메이션은 모던 모바일에서 안정적이다
  - Primary 색상을 #E03131로 조정하면 대비 4.5:1 확보 가능
- **Validation criteria**:
  - Lighthouse 디자인 감성 점수 > 90 (색상 대비, 폰트 가독성)
  - DevTools Performance 프로파일에서 애니메이션 60fps 유지 (prefers-reduced-motion 존중 확인)
  - WCAG 2.1 AA 준수: Primary CTA 대비 4.5:1 + 토스트 aria-live + 모션 감소 지원
  - 지인 피드백: "예쁘고 부드럽다"
- **Last reviewed**: council 리뷰 반영(2026-06-11)
