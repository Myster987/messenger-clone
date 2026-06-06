FROM node:22-slim
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/ ./apps/backend/

RUN pnpm install --frozen-lockfile

EXPOSE 4000

CMD ["pnpm", "--filter", "backend", "run", "start"]
