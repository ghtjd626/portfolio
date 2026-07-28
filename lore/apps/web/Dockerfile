# syntax=docker/dockerfile:1
# Lore 웹 — 멀티스테이지 빌드 (Next.js standalone · pnpm 모노레포)
# build context는 레포 루트(lore/). 예: docker build -f apps/web/Dockerfile -t lore-web .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# --- deps: 매니페스트만 먼저 복사해 레이어 캐시 극대화 ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/schema-core/package.json packages/schema-core/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile --filter "@lore/web..."

# --- build: Next standalone 산출 ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @lore/web build

# --- runner: 최소 런타임(비루트) ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1 || exit 1
CMD ["node", "apps/web/server.js"]
