# 04-database-schema.md
## 데이터베이스 스키마

### 개요
Supabase Postgres 기반 스키마. 사용자, 템플릿, 페이지(작업물), 결제, 상호작용(방명록, RSVP), 통계를 관리한다.

---

## 테이블 정의

### 1. users
사용자 계정 및 인증 정보.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- RLS 정책
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

**설명**:
- `id`: Supabase Auth의 UUID 참조
- `name`, `avatar_url`: 프로필 정보
- `phone`: RSVP 연락처 (선택사항)
- `deleted_at`: 소프트 삭제 지원 (복구 가능)

---

### 2. templates
기본 템플릿 라이브러리.

```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  vertical VARCHAR(50) NOT NULL, -- 'wedding', 'guidebook'
  category VARCHAR(100), -- 'modern', 'classic', 'minimalist' 등
  thumbnail_url TEXT NOT NULL,
  preview_url TEXT,
  default_content JSONB NOT NULL, -- 기본 내용 스키마
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_templates_vertical ON templates(vertical);
CREATE INDEX idx_templates_category ON templates(category);

-- RLS 정책: 모두 읽기 가능
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read templates"
  ON public.templates FOR SELECT
  USING (is_active = TRUE);
```

**설명**:
- `vertical`: 'wedding' (청첩장) / 'guidebook' (객실 안내)
- `default_content`: JSON 형식의 기본 섹션 구조
  ```json
  {
    "sections": [
      {
        "id": "hero",
        "type": "hero",
        "title": "신랑·신부",
        "image": null,
        "visible": true
      },
      {
        "id": "location",
        "type": "location",
        "address": "",
        "latitude": null,
        "longitude": null,
        "visible": true
      }
    ],
    "colors": {
      "primary": "#FF6B6B",
      "text": "#333333"
    }
  }
  ```

---

### 3. pages
사용자가 만든 페이지(작업물 + 발행물).

```sql
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id),
  title VARCHAR(100) NOT NULL,
  content JSONB NOT NULL, -- 사용자 커스터마이즈된 내용 (스키마 버전 포함)
  published_content JSONB, -- 발행 시점 스냅샷 (수정 중간 상태 비노출)
  schema_version INTEGER DEFAULT 1, -- 콘텐츠 스키마 버전
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'expired'
  published_url_slug VARCHAR(100) UNIQUE, -- URL 경로: /page/{slug}, 사람-읽기 접두 + 48bit 난수 접미
  published_at TIMESTAMP,
  expires_at TIMESTAMP, -- 1년 후 자동 만료
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_published_url_slug ON pages(published_url_slug) WHERE status IN ('published', 'expired');
CREATE INDEX idx_pages_expires_at ON pages(expires_at);

-- RLS 정책
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pages"
  ON public.pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON public.pages FOR UPDATE
  USING (auth.uid() = user_id);

-- 공개 페이지는 화이트리스트 필드만 반환 (SECURITY DEFINER RPC 또는 서버 라우트 사용)
-- "Anyone can read published pages" 정책 제거 → get_page_by_slug RPC로 대체

CREATE POLICY "Users can insert pages"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3.1. page_secrets
민감정보 분리 테이블 (도어락 비번, 와이파이 비번, 계좌번호).

```sql
CREATE TABLE public.page_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  secret_type VARCHAR(50) NOT NULL, -- 'door_lock', 'wifi_password', 'bank_account'
  encrypted_value TEXT NOT NULL, -- 암호화 저장 (현재 평문, 추후 암호화)
  visible_to JSONB, -- 공개 대상 (예: 뷰어, 에디터)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_id, secret_type)
);

-- RLS 정책
ALTER TABLE public.page_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owner can read secrets"
  ON public.page_secrets FOR SELECT
  USING (
    page_id IN (
      SELECT id FROM public.pages WHERE auth.uid() = user_id
    )
  );

-- 뷰어는 절대 직접 조회 불가 (SECURITY DEFINER RPC 또는 서버 라우트만 가능)
```

### SECURITY DEFINER RPC: get_page_by_slug
```sql
CREATE OR REPLACE FUNCTION get_page_by_slug(slug TEXT)
RETURNS JSON AS $$
DECLARE
  page_data JSON;
  secrets JSON;
BEGIN
  -- 1. pages 테이블에서 화이트리스트 필드만 반환
  SELECT JSON_BUILD_OBJECT(
    'id', p.id,
    'title', p.title,
    'template_id', p.template_id,
    'published_content', p.published_content,
    'schema_version', p.schema_version,
    'expires_at', p.expires_at,
    'status', p.status
  ) INTO page_data
  FROM public.pages p
  WHERE p.published_url_slug = slug
    AND p.status IN ('published', 'expired');

  IF page_data IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. 청첩장 계좌는 공개 반환 (버티컬 차등)
  -- 3. 객실 안내서 비번은 토큰 검증 후 별도 fetch(no-store) (탭-투-리빌)

  RETURN page_data;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS 우회 (SECURITY DEFINER)
ALTER FUNCTION get_page_by_slug(TEXT) SECURITY DEFINER;
```

**설명**:
- `status`: 'draft' (미발행) / 'published' (발행 후 URL 할당)
- `published_url_slug`: 고유 URL 경로 (예: "khy-wedding-2026")
- `expires_at`: 발행일로부터 365일 후 자동 설정
- `is_renewed`: 연장 결제 시 TRUE로 변경 및 `expires_at` 갱신
- `content`: 기본 구조는 템플릿에서 상속, 사용자 입력으로 덮어씀
  ```json
  {
    "sections": [
      {
        "id": "hero",
        "title": "김수진 · 박민준",
        "image": "s3://roomy-storage/user-pages/uuid/page-uuid/hero.jpg",
        "visible": true
      },
      {
        "id": "location",
        "address": "서울시 강남구 테헤란로 123",
        "visible": true
      }
    ],
    "colors": {
      "primary": "#FF6B6B"
    }
  }
  ```

---

### 4. orders
결제 정보 (모크 + 실제 결제).

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE RESTRICT, -- SET NULL → RESTRICT (발행된 페이지 삭제 방지)
  amount INTEGER NOT NULL, -- KRW 원 단위 정수 (센트 단위 금지)
  currency VARCHAR(3) DEFAULT 'KRW',
  payment_method VARCHAR(50), -- 'mock', 'toss_payments'
  payment_key VARCHAR(255), -- Toss paymentKey
  order_id VARCHAR(255) UNIQUE, -- 주문 ID (멱등성)
  transaction_id VARCHAR(255), -- 결제 제공사 거래 ID
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded', 'expired'
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  metadata JSONB, -- 결제 제공사 응답 데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_page_id ON orders(page_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_id ON orders(order_id);

-- RLS 정책
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- service role만 INSERT/UPDATE 가능 (anon key 직접 쓰기 금지)
-- RLS를 이용한 service role 검증은 Row Level Security로 별도 정책 불필요 (서버 라우트에서 검증)
```

**설명**:
- `amount_cents`: 29900 (₩299, 센트 단위로 정확성 보장)
- `transaction_id`: 모크일 때 "mock_" + 타임스탬프, 실제 결제 시 Toss ID
- `metadata`: 결제 제공사 원본 응답 저장 (추후 문제 조사 용이)
  ```json
  {
    "provider": "mock",
    "created_timestamp": 1718028000,
    "extra_data": null
  }
  ```

---

### 5. guestbook_entries
방명록(댓글).

```sql
CREATE TABLE public.guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  visitor_name VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  ip_hash VARCHAR(255), -- IP 익명화 (일별 로테이션 솔트)
  is_approved BOOLEAN DEFAULT TRUE, -- 호스트 모더레이션
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guestbook_page_id ON guestbook_entries(page_id);
CREATE INDEX idx_guestbook_created_at ON guestbook_entries(created_at DESC);

-- RLS 정책
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

-- 읽기: 공개 뷰 (visitor_email 제외, is_approved = TRUE만)
CREATE VIEW guestbook_entries_public AS
SELECT id, page_id, visitor_name, message, created_at
FROM public.guestbook_entries
WHERE is_approved = TRUE;

CREATE POLICY "Anyone can read guestbook entries (public)"
  ON public.guestbook_entries FOR SELECT
  USING (is_approved = TRUE);

-- 쓰기: Route Handler 경유 (직접 INSERT 금지)
-- 수정: 호스트 only
CREATE POLICY "Page owner can moderate guestbook"
  ON public.guestbook_entries FOR UPDATE
  USING (
    page_id IN (
      SELECT id FROM public.pages WHERE auth.uid() = user_id
    )
  );

-- 삭제: 호스트 only
CREATE POLICY "Page owner can delete guestbook entries"
  ON public.guestbook_entries FOR DELETE
  USING (
    page_id IN (
      SELECT id FROM public.pages WHERE auth.uid() = user_id
    )
  );
```

**설명**:
- 이름과 메시지만 필수 (로그인 불필요)
- 이메일은 선택사항 (호스트가 연락하고 싶을 경우)
- `is_approved`: 향후 호스트가 댓글을 승인 후 공개하는 기능 대비 (현재는 항상 TRUE)

---

### 6. rsvp_responses
참석여부 응답.

```sql
CREATE TABLE public.rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  visitor_name VARCHAR(50) NOT NULL,
  visitor_phone VARCHAR(20),
  ip_hash VARCHAR(255), -- IP 익명화 (일별 로테이션 솔트)
  attendance VARCHAR(50) NOT NULL, -- 'attending', 'not_attending'
  num_guests INTEGER,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rsvp_page_id ON rsvp_responses(page_id);
CREATE INDEX idx_rsvp_attendance ON rsvp_responses(attendance);

-- RLS 정책
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owner can read RSVP responses"
  ON public.rsvp_responses FOR SELECT
  USING (
    page_id IN (
      SELECT id FROM public.pages WHERE auth.uid() = user_id
    )
  );

-- 쓰기: Route Handler 경유 (직접 INSERT 금지)
```

**설명**:
- `attendance`: 'attending' / 'not_attending'
- `num_guests`: 인원수 (예: 4명)
- 호스트는 자신 페이지의 RSVP만 조회 가능
- 게스트는 로그인 없이 제출 가능

---

### 7. page_views
페이지 조회 통계.

```sql
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_agent TEXT,
  referrer TEXT,
  ip_hash VARCHAR(255), -- IP 익명화 (일별 로테이션 솔트)
  viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_page_views_page_id ON page_views(page_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- RLS 정책: 호스트만 자신 페이지의 조회수 볼 수 있음
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owner can read view statistics"
  ON public.page_views FOR SELECT
  USING (
    page_id IN (
      SELECT id FROM public.pages WHERE auth.uid() = user_id
    )
  );

-- 쓰기: Route Handler 경유 (서버만 INSERT, 직접 쓰기 금지)
```

**설명**:
- 매 페이지 방문 시 1행 삽입
- `ip_hash`: 개인정보 보호 (SHA-256 해시, 개인 식별 불가)
- `referrer`: 어디서 왔는지 추적 (카톡, SNS 등)
- `user_agent`: 디바이스 타입 (모바일 vs 데스크톱)
- 마이페이지에서 "조회: 123명" 정보 제공 (SELECT COUNT(*) FROM page_views WHERE page_id = ...)

---

### 8. vertical_configs (선택사항)
버티컬별 필수 섹션 설정.

```sql
CREATE TABLE public.vertical_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical VARCHAR(50) NOT NULL UNIQUE, -- 'wedding', 'guidebook'
  required_sections JSONB NOT NULL, -- 필수 섹션 리스트
  available_sections JSONB NOT NULL, -- 선택 가능 섹션
  created_at TIMESTAMP DEFAULT NOW()
);

-- 데이터 예시
-- vertical='wedding'
-- required_sections=["hero", "location", "account", "rsvp"]
-- available_sections=["hero", "story", "location", "account", "rsvp", "guestbook"]

-- vertical='guidebook'
-- required_sections=["hero", "wifi_door", "checkin", "location", "contact"]
-- available_sections=["hero", "wifi_door", "checkin", "location", "contact", "rules"]
```

---

## 데이터 흐름

### 사용자 가입 → 결제 → 페이지 발행

```
1. auth.users 생성 (Supabase Auth)
   ↓
2. public.users 생성 (프로필)
   ↓
3. 에디터에서 템플릿 선택 (templates.id)
   ↓
4. pages 테이블에 'draft' 상태로 INSERT
   ↓
5. localStorage에서 내용 불러와 content 칼럼 갱신
   ↓
6. 결제 클릭 → orders 테이블 INSERT
   ↓
7. 결제 완료 → pages.status = 'published', pages.published_url_slug 할당
   ↓
8. pages.expires_at = NOW() + 365 days
   ↓
9. URL 발급 (pages.published_url_slug 기반)
   ↓
10. 게스트가 URL 방문 → page_views INSERT
    ↓
11. 게스트 상호작용 → guestbook_entries / rsvp_responses INSERT
```

---

## RLS (Row Level Security) 정책 요약

| 테이블 | 정책 | 설명 |
|--------|------|------|
| **users** | 본인만 읽기/수정 | 개인정보 보호 |
| **templates** | 누구나 읽기 | 공개 라이브러리 |
| **pages** | 본인만 읽기/수정, 공개 페이지는 누구나 읽기 | 초안은 비공개, 발행물은 공개 |
| **orders** | 본인만 읽기 | 결제 정보 보호 |
| **guestbook_entries** | 누구나 읽기/삽입 | 댓글은 공개 |
| **rsvp_responses** | 호스트만 읽기, 누구나 삽입 | RSVP는 공개 응답 |
| **page_views** | 호스트만 읽기, 서버만 삽입 | 통계 보호 |

---

## 인덱스 전략

```sql
-- 자주 조회하는 칼럼
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_published_url_slug ON pages(published_url_slug) WHERE status = 'published';
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_guestbook_page_id ON guestbook_entries(page_id);
CREATE INDEX idx_page_views_page_id ON page_views(page_id);

-- 정렬 및 필터링
CREATE INDEX idx_guestbook_created_at ON guestbook_entries(created_at DESC);
CREATE INDEX idx_templates_vertical ON templates(vertical);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
```

---

## 마이그레이션 관리

### Supabase CLI로 스키마 버전 관리

```bash
# 스키마 변경 시
supabase migration new {feature_name}
# 파일 생성: supabase/migrations/{timestamp}_{feature_name}.sql

# 로컬 테스트
supabase db push

# 프로덕션 적용 (별도)
supabase db push --db-url=...
```

---

## 만료 관리 (Cron Job)

```sql
-- 만료된 페이지 비활성화 (1년 후)
-- 매일 자정에 실행
UPDATE pages
SET status = 'expired'
WHERE status = 'published'
  AND expires_at < NOW();

-- 게스트가 만료 페이지 접근 시 "연장하세요" 화면 표시 (grace 기간 7~30일)
-- 객실 안내서는 만료 후에도 비밀정보(도어락·와이파이) 접근 유지

-- 만료 전 사전 알림 (D-30, D-7, D-1)
-- Email + Kakao Talk notification job
```

---

## Loop Metadata

- **Upstream documents referenced**: 01-prd.md, 02-trd.md, 03-user-flow.md
- **Downstream documents affected**: 07-coding-convention.md
- **Open questions**:
  - guestbook_entries와 rsvp_responses를 통합할까? (현재는 분리)
  - page_views 테이블이 너무 빨리 커질까? (아카이빙 전략 필요?)
  - 호스트가 RSVP 응답을 내보내기(CSV) 기능 필요할까?
  - 환불 정책을 정의해야 할까? (현재 orders.refunded_at만 있음)
- **Assumptions**:
  - Supabase RLS 정책이 충분히 안전하다
  - 게스트는 로그인하지 않고도 방명록/RSVP 제출 가능 (Route Handler 게이트웨이만 허용)
  - 페이지 만료는 soft delete (완전 삭제 아님)
  - 개인정보는 최소한 수집 (이메일 제외, 휴대폰은 필요시만)
  - published_url_slug는 충분히 고엔트로피 (스캔/무차별 대입 방어)
- **Validation criteria**:
  - 스키마 생성 후 Supabase에서 정상 작동 확인
  - RLS 정책이 예상대로 작동 (테스트 케이스 작성)
  - 성능 테스트: page_views 100만 행에서 조회 < 500ms
  - SECURITY DEFINER RPC(get_page_by_slug) 테스트
  - 마이그레이션 롤백 테스트
- **Last reviewed**: council 리뷰 반영(2026-06-11)
