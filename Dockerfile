FROM zenika/alpine-chrome
USER root
RUN apk update && apk add curl bash
RUN curl -fsSL https://bun.sh/install | bash
USER chrome
WORKDIR /app
COPY . .
RUN bun install
ENTRYPOINT [ "/bin/bun","/app/main.ts" ]