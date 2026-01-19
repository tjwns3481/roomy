// @TASK T0.2 - Prisma 클라이언트 싱글톤 설정
// @SPEC docs/planning/04-database-design.md#prisma-client

import { PrismaClient } from "@prisma/client";

/**
 * Prisma 클라이언트 싱글톤
 *
 * Next.js 개발 환경에서 핫 모듈 리로딩으로 인한 다중 인스턴스 생성을 방지합니다.
 * 프로덕션 환경에서는 하나의 인스턴스만 유지합니다.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-instantiation-issue
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
