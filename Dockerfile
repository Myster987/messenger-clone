FROM oven/bun

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun i

COPY . .

EXPOSE 5173

CMD bun run dev