FROM node:24-bookworm-slim AS build

ARG REACT_APP_API_BASE_URL
ARG REACT_APP_GOOGLE_API_URL
ARG REACT_APP_STRIPE_PUBLIC_KEY

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . ./
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod 644 /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
