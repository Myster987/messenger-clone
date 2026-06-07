FROM node:22-slim AS builder
WORKDIR /app

RUN npm i -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend

RUN pnpm --filter ./apps/frontend run build

RUN pnpm --filter ./apps/frontend deploy --prod /deploy


FROM node:22-slim AS prod
WORKDIR /app

COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/build ./build
COPY --from=builder /app/apps/frontend/package.json .

ENV BODY_SIZE_LIMIT=10000000

EXPOSE 3000
CMD ["node", "build"]
