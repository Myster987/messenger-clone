FROM node:22-slim AS builder
WORKDIR /app

RUN npm i -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/db/package.json ./apps/db/

RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend
COPY apps/db ./apps/db

RUN pnpm --filter ./apps/frontend run build

FROM node:22-slim AS prod
WORKDIR /app

COPY --from=builder /app/apps/frontend/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/package.json .

EXPOSE 3000
CMD ["node", "build/index.js"]
