FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . ./
RUN npm run build

FROM node:24-bookworm-slim

RUN groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --home /app app

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY migrations ./migrations
COPY docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/uploads \
    && chown -R app:app /app

USER app

ENV NODE_ENV=production
EXPOSE 5000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
