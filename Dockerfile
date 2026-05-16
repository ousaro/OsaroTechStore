FROM node:24-bookworm-slim

RUN groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --home /app app

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY backend ./
RUN chown -R app:app /app

USER app

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "run", "backend"]
