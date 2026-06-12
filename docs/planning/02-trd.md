# 02-trd.md
## 기술 요구사항

### 기술 스택

| 계층 | 도구/프레임워크 | 선택 이유 |
|-----|------------|---------|
| **프론트엔드** | Next.js App Router + TypeScript | 풀스택 통합 개발, ISR로 뷰어 성능 최적화 |
| **프론트엔드** | TailwindCSS | 빠른 UI 구성, 감성 디자인 토큰 통합 용이 |
| **프론트엔드** | Framer Motion | Toss급 부드러운 모션/인터랙션 |
| **백엔드** | Supabase (Postgres + Auth + Storage) | 풀 매니지드, 빠른 개발, RLS 정책으로 보안 |
| **개발 환경** | Docker (로컬) | Supabase 로컬 에뮬레이션 |
| **배포** | Vercel | Next.js 네이티브, 자동 ISR, 엣지 함수 지원 |
| **결제** | 모크 어댑터 (인터페이스 분리) | 출시 직전 토스페이먼츠 연동 예정 |

---

## 뷰어 렌더링 전략

### 핵심: ISR (Incremental Static Regeneration)

```
사용자가 결제 완료
  ↓
URL 발급 (페이지 ID 생성)
  ↓
Next.js ISR: /page/[id].tsx (on-demand 생성)
  ↓
정적 HTML 생성 (CDN 캐시)
  ↓
카톡 공유 시 OG 미리보기 빠르게 로드
  ↓
재방문 시에도 정적 페이지 제공 (LCP < 2s)
```

### OG 이미지 동적 생성

- 템플릿 썸네일을 OG 이미지로 변환 (Next.js Image Optimization)
- 카톡에서 미리보기가 예쁘게 떠야 클릭율 높음
- `og:title`, `og:description`, `og:image` 동적 삽입

### 성능 목표

| 지표 | 목표 | 측정 도구 |
|-----|------|---------|
| **LCP (Largest Contentful Paint)** | < 2초 | Lighthouse |
| **FCP (First Contentful Paint)** | < 1초 | Lighthouse |
| **뷰어 모션 FPS** | 60fps 유지 | Chrome DevTools Performance |
| **번들 크기** | < 150KB (gzip) | webpack-bundle-analyzer |

---

## 데이터 아키텍처

### 비로그인 → 가입 데이터 이관 (방안 A: 익명 인증 사용)

```
1. 비로그인 사용자가 에디터 진입
   ↓
2. Supabase 익명 인증(signInAnonymously) → 임시 user_id 발급
   ↓
3. 에디터에서 템플릿 커스텀, 사진 업로드
   ↓
4. 기존 Storage 정책({user_id}/ 폴더) 그대로 사용
   ↓
5. 결제 버튼 클릭 시 "가입하세요" 모달
   ↓
6. 이메일 + 소셜(카카오) 가입
   ↓
7. linkIdentity()로 익명 계정을 실명 계정으로 승격
   ↓
8. 이제부터 정상 계정으로 관리 (임시저장 API 불필요)
```

### 주요 포인트
- **익명 사용**: localStorage base64 저장 금지 명문화
- **비번·계좌 입력 시점**: "결제 후 마무리 입력" 단계로 이동 (비로그인 단계 제외)
- **카카오 인앱 리다이렉트 시나리오**: draft 복구 키를 OAuth state 파라미터에 담아 전달
- **이관 API 통일**: 기존 transfer-draft 엔드포인트 삭제 (linkIdentity로 통합)

---

## 결제 어댑터 인터페이스 (Toss 실모델)

### 목표
토스페이먼츠 공식 API 호환 인터페이스로 설계. 모크도 실패·취소 시나리오 시뮬레이션.

### 개선된 인터페이스 (Toss API 명세 준수)

```typescript
// src/lib/payment/payment.interface.ts
export interface IPaymentProvider {
  requestPayment(params: PaymentRequestParams): Promise<PaymentResponse>;
  confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentResult>;
}

export interface PaymentRequestParams {
  orderId: string;      // 주문 ID (유니크, 중복 불가)
  amount: number;       // 원 단위 정수 (서버 검증)
  orderName: string;    // 주문 상품명
  customerEmail: string;
  customerName: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentKey?: string;           // Toss API에서 발급
  successUrl?: string;           // 결제 성공 리다이렉트
  failUrl?: string;              // 결제 실패 리다이렉트
  redirectUrl?: string;          // 결제창 URL
}

export interface PaymentResult {
  success: boolean;
  paymentKey: string;
  orderId: string;
  amount: number;
  approvedAt: Date;
  error?: { code: string; message: string };
}

// src/lib/payment/mock-provider.ts (리다이렉트 왕복 시뮬레이션)
export class MockPaymentProvider implements IPaymentProvider {
  async requestPayment(params: PaymentRequestParams): Promise<PaymentResponse> {
    // 모크: 리다이렉트 URL 반환
    const successUrl = `/payment/success?paymentKey=mock_${Date.now()}&orderId=${params.orderId}`;
    const failUrl = `/payment/fail?orderId=${params.orderId}`;
    return {
      success: true,
      successUrl,
      failUrl,
      redirectUrl: `/payment/mock?orderId=${params.orderId}&amount=${params.amount}`
    };
  }

  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<PaymentResult> {
    // 모크: 성공/실패/취소 시뮬레이션
    const random = Math.random();
    if (random < 0.1) {
      return {
        success: false,
        paymentKey,
        orderId,
        amount,
        approvedAt: new Date(),
        error: { code: 'PAYMENT_FAILED', message: '결제에 실패했습니다' }
      };
    }
    return {
      success: true,
      paymentKey,
      orderId,
      amount,
      approvedAt: new Date()
    };
  }
}
```

### 클라이언트 → 서버 금액 흐름 (중요!)
- 클라이언트: 주문 생성만 요청, **amount 전송 금지**
- 서버: 가격표에서 금액 조회 후 결제 라우터 URL 반환
- 결제 후 웹훅 또는 재확인 API로 멱등 검증

---

## 인증 아키텍처 (Supabase Auth)

### 지원 방식
- 이메일 + 비밀번호
- 카카오 OAuth (소셜 로그인)

### 정책
- 비로그인 상태: 에디터 접근 가능
- 결제 시점: 가입/로그인 강제
- 세션: JWT 토큰 (Supabase 자동 관리)

### 보안
- RLS (Row Level Security) 정책으로 사용자 데이터 격리
- 발행된 URL은 공개 (누구나 조회 가능)
- 수정은 소유자만 가능

---

## 파일 저장소 (Supabase Storage)

### 구조

```
roomy-storage/
├── templates/          # 기본 템플릿 리소스
│   ├── images/
│   └── assets/
├── user-pages/         # 사용자가 업로드한 사진
│   ├── {user_id}/
│   │   ├── {page_id}/
│   │   │   ├── hero.jpg
│   │   │   ├── section1.jpg
│   │   │   └── ...
```

### 정책
- 사용자는 본인 폴더(`{user_id}/`)에만 업로드 가능
- 클라이언트 리사이즈 후 업로드 (크기 최적화)
- 실패 시 3회 자동 재시도

---

## 캐싱 전략 (On-Demand Revalidation)

| 대상 | 기본 TTL | 이벤트 기반 리밸리데이션 |
|-----|---------|------------------------|
| 템플릿 갤러리 데이터 | 1시간 | 변경 없음 |
| 정적 뷰어 페이지 | 24시간 이하 | 발행/수정/만료/삭제 시 즉시 revalidatePath() |
| 사용자 페이지 데이터 | 없음 (실시간) | 에디터는 항상 최신 |
| OG 이미지 | 1주일 | 발행/수정 시 갱신 |
| published_content 스냅샷 | 발행 시점 캡처 | 발행/업데이트 버튼에서만 스냅샷 갱신 |

### ISR 대체: On-Demand Revalidation
```typescript
// app/api/pages/publish/route.ts
export async function POST(request: NextRequest) {
  // 1. 페이지 발행 또는 수정
  const page = await publishPage(pageId, content);
  
  // 2. published_content 스냅샷 저장 (DB)
  
  // 3. 즉시 정적 페이지 리밸리데이션
  revalidatePath(`/page/${page.published_url_slug}`, 'page');
  revalidateTag(`page-${pageId}`);
  
  return NextResponse.json(page);
}

// 만료 처리
export async function POST_EXPIRE(request: NextRequest) {
  const page = await expirePage(pageId);
  revalidatePath(`/page/${page.published_url_slug}`, 'page');
  return NextResponse.json(page);
}
```

### 민감정보: 정적 HTML/CDN에 굽지 않음
- 도어락 비번, 와이파이 비번, 계좌번호 → `page_secrets` 테이블 분리
- 뷰어 라우트에서 별도 fetch(no-store) + 토큰 검증 후 반환
- CDN 캐시 우회 (Cache-Control: private)

---

## 배포 파이프라인

### 환경

| 환경 | URL | DB | 결제 |
|-----|-----|-----|------|
| **로컬** | localhost:3000 | Docker Supabase | Mock |
| **Staging** | staging.roomy.app | Supabase Prod | Mock |
| **Production** | roomy.app | Supabase Prod | Toss (예정) |

### CI/CD (GitHub Actions)
1. PR 생성 시 자동 테스트
2. main 병합 시 자동 배포 (Vercel)
3. 환경 변수는 GitHub Secrets에서 주입

---

## 성능 최적화

### 프론트엔드
- 이미지 최적화: Next.js Image 컴포넌트, WebP 포맷
- 번들 분할: 동적 import로 에디터/뷰어 분리
- 모션: GPU 가속 (transform, opacity만 사용)

### 백엔드
- DB 인덱스: user_id, template_id, created_at
- RLS 정책 최적화: 불필요한 조회 방지
- 연결 풀: Supabase 기본값 유지

### API 응답 시간 목표
- 템플릿 갤러리 조회: < 200ms
- 페이지 저장: < 500ms
- 결제 진행: < 1초

---

## 보안 고려사항

### 입력 검증
- 익명 쓰기 단일 게이트웨이: Route Handler 경유만 허용 (직접 INSERT 금지)
- IP + page rate limit (Zod 길이 제한 포함)
- 저장 시 새니타이즈 + 렌더 시 이스케이프 이중화
- CAPTCHA: 비가시 1차(honeypot + invisible Turnstile) → 이상 트래픽 시 가시적 승격
- XSS 방지: DOMPurify로 HTML 새니타이즈
- SQL Injection 방지: Supabase 파라미터화 쿼리 사용

### 데이터 보호
- **민감정보 분리**: page_secrets 테이블(도어락 비번, 와이파이, 계좌)
  - 공개 페이지는 pages 테이블에서만 조회 (화이트리스트 필드만)
  - 비밀정보는 SECURITY DEFINER RPC(get_page_by_slug) 또는 서버 라우트에서만 반환
- **발행 스냅샷**: published_content 칼럼으로 발행 시점만 반영 (수정 중간 상태 비노출)
- **slug 규칙**: 사람-읽기 접두 + 고엔트로피 난수 접미(최소 48bit, 예: `khy-wedding-x7k2m9q4`)
- **published_url_slug UNIQUE 제약** 추가
- **호스트 연락처**: opt-in + 마스킹/인앱 중계 (상시 평문 노출 금지)
- HTTPS 강제
- CORS: 승인된 도메인만 허용

### 결제 보안
- **금액은 서버 검증**: 클라이언트가 amount 전송 금지 → orders FK 결함 수정
- 영수증 검증: 결제 후 Toss API로 재확인 (웹훅 멱등 처리)
- 타임스탬프 검증: 주문 시간과 결제 시간 일치 확인
- **orders RLS**: service role 전용 (anon 직접 INSERT/UPDATE 금지)

---

## 개발 환경 세팅

### 로컬 개발 시작
```bash
# 1. Supabase 로컬 시작
supabase start

# 2. 환경 변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 3. 개발 서버 시작
npm run dev

# 4. 브라우저: http://localhost:3000
```

### 마이그레이션
```bash
# Supabase 스키마 변경 시
supabase migration new {migration_name}
supabase db push
```

---

## Loop Metadata

- **Upstream documents referenced**: 01-prd.md
- **Downstream documents affected**: 04-database-schema.md, 07-coding-convention.md
- **Open questions**: 
  - Toss API 문서 검토 후 정확한 마이그레이션 일정 수립
  - 사진 용량 제한을 몇 MB로 설정할까? (모바일 고려)
  - OG 이미지 동적 생성 후 캐싱 시간은?
- **Assumptions**: 
  - Supabase의 Auth와 RLS가 충분히 안전하다고 신뢰
  - Next.js on-demand revalidation으로 뷰어 성능 < 2s 달성 가능
  - 토스페이먼츠는 인터페이스 분리된 어댑터로 추후 교체 가능
- **Validation criteria**: 
  - Lighthouse 성능 테스트: LCP < 2s, FCP < 1s
  - 로컬 개발 환경 세팅 검증 (신입 개발자도 30분 내 실행)
  - 결제 모크 어댑터 리다이렉트 왕복 테스트 (성공/실패/취소 시나리오)
- **Last reviewed**: council 리뷰 반영(2026-06-11)
