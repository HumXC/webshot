FROM zenika/alpine-chrome
USER root
RUN apk update && apk add curl bash
ENV BUN_INSTALL=/
RUN curl -fsSL https://bun.sh/install | bash
USER chrome
WORKDIR /app
COPY . .
RUN /bin/bun install
ENTRYPOINT [ "/bin/bun","/app/main.ts" ]