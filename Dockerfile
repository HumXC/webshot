FROM zenika/alpine-chrome
USER root
RUN apk update && apk add curl bash
ENV BUN_INSTALL=/bun
RUN curl -fsSL https://bun.sh/install | bash
USER chrome
WORKDIR /app
COPY . .
RUN /bun/bin/bun install
ENTRYPOINT [ "/bun/bin/bun","/app/main.ts" ]