FROM oven/bun

RUN addgroup app && adduser -S -G app app

USER app

WORKDIR /app

COPY package.json bun.lockb ./

USER root

RUN chown -R app:app .

USER app

RUN bun i

COPY . .

EXPOSE 5173

CMD bun run dev