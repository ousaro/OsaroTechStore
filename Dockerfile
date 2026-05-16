FROM node:24-bookworm-slim

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend ./

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "run", "backend"]
