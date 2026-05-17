FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY apps/db/package.json ./apps/db/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .
RUN pnpm --filter messenger-clone build

FROM node:22-slim AS runner
WORKDIR /app
COPY --from=builder /app /build
RUN cd /build && pnpm --filter messenger-clone deploy /app/deployed
WORKDIR /app/deployed
EXPOSE 3000
CMD ["node", "build"]
