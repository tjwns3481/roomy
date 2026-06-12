# Council 리뷰 리포트

> 대상: Roomy(StayMate) 기획 문서 (01-prd.md ~ 07-coding-convention.md)
> 작성일: 2026-06-11

## 실행 모드

workflow 모드 — 리뷰어 3인(CTO / UX / Security)이 병렬로 초기 리뷰를 작성한 뒤, 서로의 리뷰를 교차검증(동의/반대/대안 제안)하고 점수를 수정했습니다.

## 참여자 표

| 리뷰어 | 관점 | 초기 점수 | 수정 점수 | 변화 |
|---|---|---|---|---|
| CTO | 아키텍처·데이터·결제 정합성 | 5.5 | 4.5 | -1.0 (UX·Security의 치명 지적 확인 후 하향) |
| UX | 퍼널·화면·접근성 | 6.0 | 5.0 | -1.0 (자기 발견한 치명 2건의 심각도 재반영) |
| Security | 보안·개인정보 | 3.5 | 3.0 | -0.5 (CTO의 대량 유출 지적으로 공격 비용이 더 낮음을 확인) |
| **평균** | | **5.0** | **4.17** | |

## 합의 사항 (전원 동의)

3인 모두 원문을 대조해 확인한 항목입니다.

1. **[치명] 발행 페이지 RLS가 민감정보 대량 유출 경로** — 04-database-schema.md의 `"Anyone can read published pages" USING (status='published')` 정책 때문에 anon key 쿼리 한 번으로 전체 발행 페이지의 content JSONB(도어락 비번, 와이파이 비번, 계좌번호)를 slug 없이 일괄 수집 가능. `published_url_slug`에 UNIQUE 제약도 없음(부분 인덱스만 존재).
2. **[치명] "개인정보 암호화 저장" 선언이 공문구** — 02-trd.md는 암호화 저장을 선언했지만 04 스키마에 암호화 칼럼·키 관리 수단이 전혀 없고, 같은 평문 JSONB가 ISR 정적 HTML과 CDN 캐시(TTL 1개월)에 복제됨.
3. **[치명] ISR 전략과 제품 정책의 모순** — `revalidate: 2592000`(1개월)은 "구매 후 무제한 수정"·"1년 만료"와 충돌. 수정·만료·비번 변경이 최대 한 달간 반영되지 않는데 on-demand revalidation이 어느 문서에도 없음.
4. **[치명] 비로그인 사진 업로드 설계 모순** — 06-screens.md 내에서 localStorage 예시(base64 이미지)와 Assumptions("BASE64 아님, 서버 저장")가 정면 모순. Storage 정책은 `{user_id}/` 폴더만 허용해 비로그인 업로드 경로 자체가 없음. 이관 API도 02(register 응답 포함)와 06(transfer-draft)이 서로 다르고, 카카오 OAuth 리다이렉트에서 단일 호출 모델이 깨짐.
5. **[높음] 결제 설계 이중 결함** — `confirmPayment(impUid, merchantUid)`는 아임포트 용어로 토스페이먼츠(paymentKey/orderId/successUrl 리다이렉트/웹훅) 모델과 비호환. 06 S5에서는 클라이언트가 `amount: 29900`을 직접 보내고 응답이 즉시 `completed` — 02의 "금액은 서버에서 검증" 원칙과 모순. SQL 결함(`page_id NOT NULL + ON DELETE SET NULL`, KRW에 cents 단위 사용)도 실재.
6. **[높음] 익명 쓰기 3종(guestbook/RSVP/page_views) 무방비** — 모두 `WITH CHECK (TRUE)`로 rate limit·길이 제한·봇 방지 전무. page_views는 누구나 INSERT 가능해 조회 통계 조작 가능. guestbook "Anyone can read"는 visitor_email 칼럼까지 익명 노출(RLS는 행 단위). guestbook에 UPDATE/DELETE 정책이 없어 호스트가 욕설 댓글을 비공개/삭제할 방법이 스키마상 부재.
7. **[높음] 객실 안내서 만료·오프라인이 게스트 숙박을 차단** — 체크인 당일 만료 시 도어락/와이파이 접근 불가인데 호스트 연락처가 "선택사항", 오프라인 안내도 "선택사항". 만료 사전 알림 플로우 없음.
8. **[높음] 카카오 인앱 브라우저·iOS ITP로 임시저장 유실 가능** — 카톡 공유가 핵심 유입 채널인데 인앱 브라우저 localStorage 격리, ITP 7일 삭제(제작은 며칠 걸림) 시나리오가 어느 문서에도 없음.
9. **[높음] 접근성 자기모순** — Primary #FF6B6B 위 흰 텍스트 대비 약 2.7~2.8:1로, 05가 스스로 선언한 "WCAG 2.1 AA(4.5:1)" 미달. prefers-reduced-motion이 4개 문서 전체에 부재.
10. **[중간] 개인정보 보존·파기 정책 부재** — soft delete 무기한 보존, 제3자(하객·게스트) PII 수집 동의/고지 UI 없음, 무솔트 SHA-256 ip_hash는 IPv4 전수 역산 가능.
11. **[중간] 섹션 플러그인 타입 안전성 허약** — `data as any`(07)는 "strict 모드" 가정과 모순, JSONB→무검증 렌더링은 stored XSS 경로의 마지막 고리. content에 schema_version 없음, cron의 `status='expired'`는 status 정의에 없는 값.
12. **[중간] 문서 간 잔여 불일치** — 자동저장 주기(03 "매 입력마다" vs 06 "3초 간격"), 이관 API 엔드포인트 이중 정의.

## 주요 개선 제안 (우선순위 순)

### P0-1. 민감정보 분리 + 데이터 접근 모델 재설계
- **대상: 04-database-schema.md (pages RLS, 신규 page_secrets 테이블), 02-trd.md (렌더링 전략)**
- pages의 "Anyone can read published" anon SELECT 정책을 제거하고, slug 정확 일치만 허용하는 SECURITY DEFINER RPC(`get_page_by_slug`) 또는 서버 라우트의 화이트리스트 필드 반환으로 교체.
- 도어락·와이파이 비번·계좌번호를 `page_secrets` 테이블로 분리(소유자 + service role만 접근). 민감정보는 정적 HTML/CDN에 굽지 않고 뷰어에서 별도 fetch(no-store).
- slug 생성 규칙 명문화: 사람-읽기 접두 + 고엔트로피 난수 접미(최소 48bit, 예: `khy-wedding-x7k2m9q4`), `published_url_slug` UNIQUE 제약 추가.
- 버티컬 차등: 청첩장 계좌는 공개 반환(시장 표준 유지), 객실 안내서 비번은 공유 URL에 내장된 토큰 검증 후 반환 + 탭-투-리빌(게스트 추가 입력 없음).

### P0-2. ISR을 on-demand revalidation + 발행 스냅샷으로 교체
- **대상: 02-trd.md (캐싱 표), 04-database-schema.md (published_content 칼럼)**
- 발행/수정/만료/삭제 4개 이벤트에 `revalidatePath`/`revalidateTag` 호출 명시, fallback revalidate는 24h 이하로 단축.
- `published_content` 스냅샷 칼럼 도입 — "발행/업데이트 버튼" 시점만 라이브 반영, 편집 중간 상태 비노출. 뷰어 라우트에서 expires_at 런타임 체크로 이중 방어.

### P0-3. 결제를 토스 실모델로 재정의
- **대상: 02-trd.md (IPaymentProvider, API 명세), 06-screens.md (S5 API), 04-database-schema.md (orders)**
- 인터페이스를 paymentKey/orderId/amount + successUrl/failUrl 리다이렉트 + 웹훅 멱등 처리 기준으로 재정의. 모크도 리다이렉트 왕복·실패·취소를 시뮬레이션해 실패 UX를 출시 전에 리허설.
- 클라이언트 amount 전송 삭제 — 서버가 가격표에서 금액 결정. orders INSERT/UPDATE는 service role 전용임을 RLS에 명시.
- `amount_cents` → `amount`(KRW 원 단위 정수), `page_id` FK는 NULLABLE+SET NULL 또는 RESTRICT로 SQL 결함 수정.

### P0-4. 비로그인 draft·사진 이관 재설계
- **대상: 02-trd.md (Storage 정책·이관 API), 03-user-flow.md (가입 전환 시퀀스), 06-screens.md (S4 localStorage 예시)**
- 방안 A(CTO): Supabase 익명 인증(`signInAnonymously`)으로 임시 user_id 발급 → 기존 Storage 정책 그대로 사용, 가입 시 `linkIdentity`로 승격(이관 API 자체가 불필요해짐).
- 방안 B(UX/Security): 익명 staging 버킷 + 서명 업로드 URL(72h TTL) + 가입 시 move. 둘 중 하나로 확정하고 localStorage base64 금지를 명문화, 이관 API는 하나로 통일.
- 도어락 비번·계좌번호는 비로그인 단계 입력에서 제외하고 "결제 후 마무리 입력"으로 이동(localStorage 평문 잔존 위험 제거 + 5분 제작에도 유리).
- 카카오 인앱 브라우저 시나리오(리다이렉트 복귀, draft 복구 키를 state 파라미터로 운반)를 03에 추가.

### P1-5. 익명 쓰기 단일 게이트웨이
- **대상: 04-database-schema.md (guestbook/rsvp/page_views RLS), 02-trd.md (API 계층)**
- anon 직접 INSERT를 폐지하고 Route Handler 경유로 통일: IP+page rate limit, 길이 제한(zod), 저장 시 새니타이즈 + 렌더 시 이스케이프 이중화. 가시적 CAPTCHA는 이상 트래픽 시에만 승격(비가시 1차).
- guestbook 읽기는 visitor_email 제외 view로 교체. 호스트용 UPDATE(is_approved 토글)/DELETE 정책 추가로 모더레이션을 현재 스키마에 포함. ip_hash는 일별 로테이션 솔트 적용.

### P1-6. 만료 grace 기간 + 사전 알림
- **대상: 03-user-flow.md (만료 플로우), 06-screens.md (S6/S7), 04-database-schema.md (연장 이력)**
- D-30/D-7/D-1 이메일·알림톡 사전 알림을 P0로 승격. 만료 후 7~30일 read-only grace(객실 안내서는 비밀정보 접근 유지). 호스트 연락처는 opt-in + 마스킹/인앱 문의 형태.
- 객실 안내서는 오프라인 캐시(게스트 1회 열람 후 로컬 캐시)를 "선택사항"에서 P0로 격상. `is_renewed BOOLEAN` 대신 연장 이력을 orders와 연결.

### P1-7. 에디터 S4 모바일 레이아웃 정의
- **대상: 06-screens.md (S4 와이어프레임, Assumptions)**
- 320~480px: 단일 패널 폼 + 하단 "미리보기" 버튼 → 풀스크린 오버레이(닫기 시 마지막 편집 필드로 복귀). 2패널은 1024px 이상 전용으로 격하하고 Assumptions에 에디터 예외 명기.

### P2-8. 접근성·모션 최소선
- **대상: 05-design-system.md**
- Primary CTA 대비 4.5:1 확보(텍스트 어둡게 또는 배경 #E03131~#B91C1C 계열), `useReducedMotion` 전역 가드, 토스트 최소 4초 + aria-live=polite.

### P2-9. 지표·문구 정리
- **대상: 01-prd.md (성공 기준), 03/06 (자동저장 주기)**
- "5분" 단일 지표를 퍼널 3분해(에디터 체류/인증 소요/결제 소요) + 단계별 이탈률로 확장. 이메일 검증은 "결제 후 비동기"로 확정. 자동저장은 "입력 후 3초 디바운스"로 통일.

### P2-10. 섹션 타입 안전성
- **대상: 07-coding-convention.md, 04-database-schema.md**
- `data as any` 제거, 섹션별 payload Zod 스키마 + 런타임 검증. content에 schema_version 추가. status enum에 'expired' 추가.

## 미합의 쟁점 (사용자 결정 필요)

1. **청첩장 계좌번호의 보호 강도** — Security: 도어락 비번과 같은 민감정보로 분리·암호화. CTO/UX: 축의금 계좌는 수백 명에게 보여주려고 게시하는 정보이므로 버티컬별 차등 적용("암호화 저장 + 공개 표시"면 충분), 일괄 최강 적용은 청첩장 UX만 잃는 과잉 설계. → **버티컬별 차등 여부 결정 필요.**
2. **객실 안내서 접근 토큰 방식** — Security: 페이지 단위 접근 토큰. UX: 게스트가 무언가 입력해야 하는 형태(PIN 등)는 새벽 체크인에 치명적 마찰, 토큰은 URL에 내장돼 입력이 없어야 함. 탭-투-리빌만으로는 스크래핑을 못 막으므로 근본은 RLS/RPC 계층. → **토큰 운반 방식(URL fragment vs PIN vs 없음) 결정 필요.**
3. **익명 쓰기의 CAPTCHA 도입 시점** — Security: CAPTCHA 포함 즉시 차단 계층. UX: 가시적 CAPTCHA는 고령 하객의 제출 포기를 유발, 비가시 계층(honeypot, invisible Turnstile) 1차 + 이상 트래픽 시 승격. → **MVP에 넣을 방어 계층 범위 결정 필요.**
4. **만료 화면의 호스트 연락처 노출** — UX: "선택사항"에서 필수로 격상. Security: 공개 URL에 전화번호 상시 노출은 새 개인정보 유출, opt-in + 마스킹/인앱 중계 형태여야 함. → **노출 형태 결정 필요.**
5. **가입 모달 마찰의 심각도와 해법** — UX: 결제 직전 3필드 폼은 높음 등급. Security/CTO: 비밀번호+약관은 법적·보안 최소치이고 카카오 OAuth가 1순위 경로인 이상 폴백이므로 중간 등급, 해법은 필드 삭제가 아니라 경로 설계(카카오 원탭 기본). → **이메일 폼 간소화 수준 결정 필요.**
6. **전체 판정 — 수정 후 진행 vs stop-ship** — CTO 4.5/UX 5.0: 결함 대부분이 구현 전 문서 수정으로 교정 가능한 설계 결함. Security 3.0: 도어락 비번 대량 유출 구조는 다른 축과 트레이드오프 불가한 stop-ship급이며 P0-1 반영 전 구현 착수 불가. → **P0-1~P0-4 반영을 구현 착수 조건으로 삼을지 결정 필요.**
7. **'5분 제작' 지표 정의** — UX: 가입·결제 제외 측정은 자기위안. CTO: 구간 분리 측정 자체는 올바른 실험 설계이고 문제는 보완 퍼널 지표(전환율·이탈률) 부재. → **지표 체계 확정 필요.**
8. **포토 갤러리·BGM 부재** — UX: 시장 표준 기대와의 갭. CTO: MoSCoW 컷은 정당한 의사결정이며, 처방은 기능 추가 강제가 아니라 "완성형 프로덕트" 포지셔닝 문구 수정 또는 갤러리만 P0 승격 중 택일. → **택일 필요.**

## 리뷰어별 상세

### CTO — 5.5 → 4.5

**강점으로 본 것**: 결제 어댑터 인터페이스 분리(02), 섹션 viewer/editor 레지스트리 구조(07), 테이블별 RLS 명시 시도(04), Loop Metadata로 알려진 부채 추적, 소프트 삭제 기본값.

**약점으로 본 것**: 발행 페이지 RLS 대량 유출(치명), ISR vs 무제한 수정 모순(치명), 토스 비호환 결제 인터페이스 + SQL 결함(높음), 비로그인 이관 구멍(높음), 섹션 타입/버전 안전성(중간).

**교차검증에서**: UX의 S4 모바일 부재·base64 모순·인앱 브라우저·접근성·만료 지적과 Security의 전 지적에 동의. 반대한 것은 "5분 지표 자기위안" 표현(분리 측정 자체는 타당), 갤러리 부재를 결함으로 보는 시각(MoSCoW 컷은 의사결정), 접근 토큰 전 버티컬 일괄 적용(버티컬 차등 필요), 가입 모달 '높음' 등급(조건부 리스크이므로 중간). 점수 하향 사유: 자신이 놓친 치명 2건(S4 모바일, 물리 침입 프레임)이 확인됨.

### UX — 6.0 → 5.0

**강점으로 본 것**: 결제 전 전체 미리보기 + 작업물 보존 이탈 경로, 화면별 4종 상태 정의 체계, 비로그인 제작 시작 퍼널 구조, 모션 토큰화, 게스트 핵심 과업의 저마찰 설계.

**약점으로 본 것**: S4 에디터 모바일 레이아웃 부재(치명), 비로그인 사진 저장 모순(치명), 가입 모달 마찰 + 인앱 브라우저/ITP(높음), 모션 과잉·CTA 대비 미달(높음), 안내서 만료/오프라인이 숙박 차단(높음), 5분 지표·갤러리 부재·모더레이션 방치(중간).

**교차검증에서**: CTO·Security의 치명 지적 전부를 행 번호까지 원문 대조로 확인. 반대한 것은 탭-투-리빌 단독 처방(표시 계층일 뿐, 근본은 RLS/RPC + 게스트 무입력 토큰), 계좌번호를 도어락급으로 보는 프레임(버티컬 분리), "편집 중 노출" 지적(ISR 1개월 캐시와 양립 불가 — 진짜 결함은 발행 모델 미정의), 가시적 CAPTCHA(고령 하객 이탈), page_views 동기화의 심각도(구현 디테일). 점수 하향 사유: 자기 발견한 치명 2건의 심각도를 점수가 반영하지 못했음을 인정.

### Security — 3.5 → 3.0

**강점으로 본 것**: 테이블별 RLS 설계 시도, TRD 보안 원칙 선언의 방향성, ip_hash 익명화 의식, 결제 어댑터 격리.

**약점으로 본 것**: 도어락 비번이 추측 가능한 공개 URL에 평문 노출 — 물리 침입 직결(치명), 암호화 선언 vs 스키마 구현 모순(치명), 익명 쓰기 3종 무제한 개방 + visitor_email 노출 + stored XSS 경로(높음), 결제 금액 클라이언트 전송(높음), 보존·파기 정책 부재 + 캐시 수명 충돌(중간).

**교차검증에서**: CTO의 대량 SELECT 지적을 "내 추측·열거 지적보다 치명적 — 그냥 전부 조회된다"로 상향 수용, guestbook UPDATE/DELETE RLS 부재를 추가 발견. 반대한 것은 CTO/UX의 5.5/6 점수(stop-ship급 구조 결함이 있는 기획은 중간값 이상 불가), 가입 모달 필드 축소(법적 최소치 — 경로 설계로 해결), 만료 화면 연락처 상시 노출(새 개인정보 유출), page_views 동기화 우선순위(쓰기 통제가 선행 조건). 점수 하향 사유: 공격 비용이 "추측"에서 "쿼리 한 번"으로 떨어짐을 확인.
