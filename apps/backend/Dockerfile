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

FROM node:22-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY --from=deps /app /build
RUN cd /build && pnpm --filter backend deploy /app/deployed
WORKDIR /app/deployed
EXPOSE 4000
CMD ["pnpm", "run", "start"]
