FROM oven/bun
WORKDIR /app
COPY . .
RUN bun install
ENTRYPOINT [ "bun","/app/main.ts" ]