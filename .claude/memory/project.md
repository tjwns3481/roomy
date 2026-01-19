# Project Memory

## 기본 정보
- 프로젝트명: Roomy
- 기술 스택: Next.js 14 (Fullstack) + PostgreSQL (Supabase)
- 시작일: 2026-01-19

## 아키텍처
- 프레임워크: Next.js 14 (App Router)
- API: Hono (API Routes)
- 인증: Clerk
- 데이터베이스: PostgreSQL (Supabase)
- ORM: Prisma
- 상태관리: Zustand + TanStack Query
- 스타일링: TailwindCSS
- 드래그앤드롭: @dnd-kit
- 검증: Zod

## 특이사항
- 인증: Clerk 기반 OAuth 인증 포함
- MCP: Gemini 3 Pro (프론트엔드 디자인 AI)
- 워크플로우: Contract-First TDD
- Git 전략: Phase별 Worktree 분리

## 프로젝트 설명
Roomy는 에어비앤비 호스트를 위한 디지털 숙소 안내서 플랫폼입니다.
- 호스트가 드래그앤드롭으로 안내서 블록을 구성
- 게스트에게 고유 URL로 안내서 공유
- AI 챗봇으로 게스트 질문 자동 응답
