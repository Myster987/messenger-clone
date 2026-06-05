FROM node:22-slim
WORKDIR /app

RUN npm i -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/db/ ./apps/db/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter ./apps/db run db:generate

CMD ["pnpm", "--filter", "./apps/db", "run", "db:migrate"]
