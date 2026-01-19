# TRD (기술 요구사항 정의서)

> Roomy - 에어비앤비 호스트를 위한 디지털 숙소 안내서 플랫폼

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 에어비앤비 호스트가 종이 안내서 없이 디지털 안내서를 만들고 공유할 수 있게 한다 |
| 2 | 페르소나 | 부업 호스트 (숙소 1-2개 운영) **[가설]** |
| 3 | 핵심 기능 | FEAT-1: 안내서 생성 및 발행 |
| 4 | 성공 지표 (노스스타) | MRR ₩100만 (6개월) |
| 5 | 입력 지표 | 발행된 안내서 수, 안내서 조회수 |
| 6 | 비기능 요구 | 게스트 뷰 페이지 로드 < 2초 |
| 7 | Out-of-scope | AI 챗봇, 다국어 지원 |
| 8 | Top 리스크 | 타겟 페인 포인트 미검증 |
| 9 | 완화/실험 | MVP 전 사용자 조사 |
| 10 | 다음 단계 | 한국 호스트 인터뷰 5-10명 |

---

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Client       │     │    Next.js      │     │   PostgreSQL    │
│  (React/Next)   │────▶│  API Routes     │────▶│   (Supabase)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Clerk       │     │   Supabase      │     │   Cloudflare    │
│  (인증/인가)     │     │   Storage       │     │    (CDN)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 1.2 컴포넌트 설명

| 컴포넌트 | 역할 | 왜 이 선택? |
|----------|------|-------------|
| Next.js App Router | 풀스택 프레임워크 | SSR + API 통합, Vercel 최적화 |
| Clerk | 인증 서비스 | 소셜 로그인 쉽게 구현, 관리 부담 감소 |
| Supabase | DB + Storage | PostgreSQL + 파일 스토리지 통합, 무료 티어 충분 |
| Vercel | 호스팅 | Next.js 공식 호스팅, 글로벌 CDN |

---

## 2. 기술 스택 (확정)

### 2.1 프론트엔드

| 항목 | 선택 | 이유 | 벤더 락인 |
|------|------|------|-----------|
| 프레임워크 | Next.js 14 | App Router, Server Components | 중간 (React 기반) |
| 언어 | TypeScript | 타입 안정성, 자동완성 | 낮음 |
| 스타일링 | TailwindCSS | 빠른 스타일링, 유틸리티 기반 | 낮음 |
| 상태관리 | Zustand | 가볍고 직관적 | 낮음 |
| 서버 상태 | TanStack Query | 캐싱, 서버 상태 관리 | 낮음 |
| 드래그앤드롭 | @dnd-kit | 접근성 좋음, React 친화적 | 낮음 |
| QR 생성 | qrcode | 가벼움, 기능 충분 | 낮음 |

### 2.2 백엔드

| 항목 | 선택 | 이유 | 벤더 락인 |
|------|------|------|-----------|
| API | Next.js API Routes (Hono) | 풀스택, 타입 공유 | 중간 |
| ORM | Prisma | Type-safe, 마이그레이션 관리 | 중간 |
| 검증 | Zod | TypeScript 친화적 | 낮음 |

### 2.3 데이터베이스

| 항목 | 선택 | 이유 |
|------|------|------|
| 메인 DB | PostgreSQL (Supabase) | 안정성, JSON 지원, 무료 티어 |
| 파일 스토리지 | Supabase Storage | DB와 통합, S3 호환 |

### 2.4 인프라

| 항목 | 선택 | 이유 |
|------|------|------|
| 호스팅 | Vercel | Next.js 최적화, 글로벌 CDN |
| 인증 | Clerk | 소셜 로그인, 세션 관리 |
| 이미지 최적화 | Vercel Image Optimization | Next.js 기본 제공 |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| 게스트 뷰 FCP | < 1.5초 | Lighthouse |
| 게스트 뷰 LCP | < 2.5초 | Core Web Vitals |
| API 응답 시간 | < 200ms (P95) | Vercel Analytics |
| 에디터 저장 | < 500ms | 클라이언트 측정 |

### 3.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | Clerk (JWT + Session) |
| HTTPS | 필수 (Vercel 기본 제공) |
| API 인증 | Clerk Middleware |
| 입력 검증 | Zod (서버 측 필수) |
| XSS 방지 | React 기본 이스케이핑 |
| SQL Injection | Prisma ORM 사용 |

### 3.3 확장성

| 항목 | MVP | v2 목표 |
|------|-----|---------|
| 동시 접속자 | 100명 | 1,000명 |
| 안내서 수 | 1,000개 | 10,000개 |
| 이미지 스토리지 | 10GB | 100GB |

---

## 4. 외부 서비스 연동

### 4.1 인증

| 서비스 | 용도 | 필수/선택 | 연동 방식 |
|--------|------|----------|----------|
| Clerk | 인증 관리 | 필수 | SDK |
| Google OAuth | 소셜 로그인 | 필수 | Clerk 통합 |

### 4.2 기타 서비스

| 서비스 | 용도 | 필수/선택 | 비고 |
|--------|------|----------|------|
| Supabase | DB + Storage | 필수 | 무료 티어 사용 |
| Vercel | 호스팅 | 필수 | Pro 플랜 권장 |
| Resend | 이메일 발송 | 선택 | 트랜잭션 이메일 (v2) |

---

## 5. 접근제어/권한 모델

### 5.1 역할 정의

| 역할 | 설명 | 권한 |
|------|------|------|
| Guest | 비로그인 | 발행된 안내서 열람만 |
| Host (Free) | 무료 사용자 | 안내서 1개 생성/관리 |
| Host (Pro) | 유료 사용자 | 안내서 3개, 통계 |
| Host (Business) | 비즈니스 | 무제한, 팀 기능 |

### 5.2 권한 매트릭스

| 리소스 | Guest | Host (Free) | Host (Pro) |
|--------|-------|-------------|------------|
| 안내서 열람 | O (발행된 것만) | O | O |
| 안내서 생성 | - | O (1개) | O (3개) |
| 안내서 수정 | - | O (본인) | O (본인) |
| 안내서 삭제 | - | O (본인) | O (본인) |
| 통계 조회 | - | - | O |
| 팀 관리 | - | - | - (Business) |

---

## 6. 데이터 생명주기

### 6.1 원칙

- **최소 수집**: 필요한 데이터만 수집
- **명시적 동의**: 개인정보 수집 전 동의
- **보존 기한**: 목적 달성 후 삭제

### 6.2 데이터 흐름

```
수집 → 저장 → 사용 → 보관 → 삭제/익명화
```

| 데이터 유형 | 보존 기간 | 삭제/익명화 |
|------------|----------|------------|
| 계정 정보 | 탈퇴 후 30일 | 완전 삭제 |
| 안내서 데이터 | 계정과 동일 | Cascade 삭제 |
| 조회 통계 | 1년 | 익명화 |
| 이미지 파일 | 안내서 삭제 시 | 완전 삭제 |

---

## 7. 테스트 전략

### 7.1 개발 방식: Contract-First Development

BE(API Routes)/FE가 독립적으로 병렬 개발하면서 통합 시 호환성 보장.

```
┌─────────────────────────────────────────────────────────────┐
│                    Contract-First 흐름                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 계약 정의 (Phase 0)                                     │
│     ├─ API 계약: frontend/src/contracts/*.contract.ts       │
│     └─ 타입 공유: TypeScript 인터페이스                      │
│                                                             │
│  2. 테스트 선행 작성 (RED)                                   │
│     ├─ API 테스트: frontend/src/__tests__/**/*.test.ts      │
│     └─ 모든 테스트가 실패하는 상태 (정상!)                   │
│                                                             │
│  3. Mock 생성 (FE 독립 개발용)                               │
│     └─ MSW 핸들러: frontend/src/mocks/handlers/*.ts         │
│                                                             │
│  4. 구현 (RED→GREEN)                                        │
│     └─ 테스트 통과 목표로 구현                               │
│                                                             │
│  5. 통합 검증                                               │
│     └─ E2E 테스트: frontend/e2e/                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 테스트 피라미드

| 레벨 | 도구 | 커버리지 목표 | 위치 |
|------|------|-------------|------|
| Unit | Vitest | ≥ 80% | src/__tests__/ |
| Integration | Vitest + MSW | Critical paths | src/__tests__/ |
| E2E | Playwright | Key user flows | e2e/ |

### 7.3 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 |
| React Testing Library | 컴포넌트 테스트 |
| MSW | API 모킹 |
| Playwright | E2E 테스트 |

### 7.4 품질 게이트

**병합 전 필수 통과:**
- [ ] 모든 단위 테스트 통과
- [ ] 커버리지 ≥ 80%
- [ ] ESLint 통과
- [ ] TypeScript 타입 체크 통과
- [ ] E2E 테스트 통과 (해당 기능)

**검증 명령어:**
```bash
# 테스트
npm run test -- --coverage

# 린트
npm run lint

# 타입 체크
npm run type-check

# E2E
npx playwright test
```

---

## 8. API 설계 원칙

### 8.1 RESTful 규칙

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 조회 | GET /api/guides/{id} |
| POST | 생성 | POST /api/guides |
| PUT | 전체 수정 | PUT /api/guides/{id} |
| PATCH | 부분 수정 | PATCH /api/guides/{id} |
| DELETE | 삭제 | DELETE /api/guides/{id} |

### 8.2 응답 형식

**성공 응답:**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

**에러 응답:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "title", "message": "제목은 필수입니다" }
    ]
  }
}
```

### 8.3 주요 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| /api/guides | GET | 내 안내서 목록 | O |
| /api/guides | POST | 안내서 생성 | O |
| /api/guides/{id} | GET | 안내서 상세 | O |
| /api/guides/{id} | PUT | 안내서 수정 | O |
| /api/guides/{id} | DELETE | 안내서 삭제 | O |
| /api/guides/{id}/publish | POST | 안내서 발행 | O |
| /api/upload | POST | 이미지 업로드 | O |
| /g/{slug} | GET | 게스트 뷰 (SSR) | - |

---

## 9. 프로젝트 구조

```
roomy/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/             # 인증 페이지
│   │   │   ├── (guest)/            # 게스트 뷰
│   │   │   │   └── g/[slug]/       # 안내서 열람
│   │   │   ├── (protected)/        # 인증 필요 페이지
│   │   │   │   ├── dashboard/      # 대시보드
│   │   │   │   └── editor/[id]/    # 에디터
│   │   │   ├── api/                # API Routes
│   │   │   └── page.tsx            # 랜딩
│   │   ├── components/
│   │   │   ├── blocks/             # 블록 에디터 컴포넌트
│   │   │   ├── editor/             # 에디터 관련
│   │   │   ├── guest/              # 게스트 뷰 컴포넌트
│   │   │   ├── dashboard/          # 대시보드 컴포넌트
│   │   │   └── ui/                 # 공통 UI
│   │   ├── contracts/              # API 계약 정의
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── lib/                    # 유틸리티
│   │   ├── mocks/                  # MSW 모킹
│   │   ├── stores/                 # Zustand 스토어
│   │   └── __tests__/              # 테스트
│   ├── prisma/
│   │   └── schema.prisma           # DB 스키마
│   ├── e2e/                        # E2E 테스트
│   └── public/
├── docs/
│   └── planning/                   # 기획 문서
└── docker-compose.yml
```

---

## Decision Log

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-01-19 | 기술 스택 확정 | Next.js + Prisma + Supabase |
| 2026-01-19 | Clerk 인증 사용 | 소셜 로그인 구현 간소화 |
| 2026-01-19 | AI 챗봇 Phase 2로 | MVP 범위 축소, Nice-to-have |
