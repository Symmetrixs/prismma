FROM cgr.dev/chainguard/node:latest-dev AS builder
WORKDIR /app
COPY system/package.json ./
RUN npm install
COPY system/ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine-slim AS runner
USER root
RUN apk update && apk upgrade
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/system.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
