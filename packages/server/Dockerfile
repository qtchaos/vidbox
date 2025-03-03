FROM oven/bun:1
COPY / ./

ENV DEBUG=1
RUN bun install --production

EXPOSE 3000
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
