FROM oven/bun:1.2.22-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/package.json
COPY bun.lock /app/bun.lock
RUN bun install --frozen-lockfile --production

COPY tsconfig.json /app/tsconfig.json
COPY src /app/src

USER bun
ENTRYPOINT [ "bun", "run", "/app/src/main.ts" ]
