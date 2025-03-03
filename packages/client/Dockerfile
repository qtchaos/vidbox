FROM oven/bun:1
WORKDIR /src
COPY / ./

RUN bun install --production
RUN bun run build

EXPOSE 80
ENTRYPOINT [ "bun", "run", "preview" ]