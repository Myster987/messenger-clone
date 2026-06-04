FROM node:22-bullseye-slim AS builder

WORKDIR /app

COPY package*.json .
RUN npm i -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run frontend:build
RUN pnpm prune --prod

FROM builder AS prod

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .

EXPOSE 3000

CMD ["node", "apps/frontend/build"]
