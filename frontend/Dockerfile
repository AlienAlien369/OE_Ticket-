# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Bake production env vars into the Vite bundle at build time.
# VITE_API_BASE_URL is relative so nginx proxy_pass handles routing
# to the backend container (no CORS, no port exposure needed).
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_ENABLE_MOCKS=false
ARG VITE_APP_VERSION=1.0.0
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
