FROM node:22-slim
RUN npm i -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/frontend/ ./apps/frontend/
COPY apps/backend/ ./apps/backend/
COPY apps/db/ ./apps/db/
RUN pnpm install
EXPOSE 4000
CMD ["pnpm", "--filter", "backend", "run", "start"]
