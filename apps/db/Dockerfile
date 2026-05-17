FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/ ./apps/

RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app

COPY --from=deps /app /build
RUN cd /build && pnpm --filter db --prod deploy /app/deployed

WORKDIR /app/deployed
CMD ["pnpm", "run", "db:migrate"]
