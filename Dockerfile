# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm i -g pnpm
RUN pnpm run typecheck

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Копируем winston-loki и его зависимости из node_modules builder stage
# так как Next.js standalone может не включить динамически загружаемые модули
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/winston-loki ./node_modules/winston-loki

# Копируем опциональные зависимости winston-loki (если они существуют)
# Используем RUN для проверки существования перед копированием
USER root
RUN mkdir -p ./node_modules && \
    if [ -d /app/node_modules/@napi-rs ]; then \
      cp -r /app/node_modules/@napi-rs ./node_modules/ 2>/dev/null || true; \
    fi && \
    if [ -d /app/node_modules/snappy ]; then \
      cp -r /app/node_modules/snappy ./node_modules/ 2>/dev/null || true; \
    fi && \
    chown -R nextjs:nodejs ./node_modules
USER nextjs

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]