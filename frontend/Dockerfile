# ── Stage 1: build React app ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install deps first (better layer caching)
# If package.json hasn't changed, this layer is reused on next build
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .

# VITE_BACKEND_URL at build time — empty means use nginx proxy (/api/)
# For Vercel/Render where nginx isn't used, this is set as an env var
ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# ── Stage 2: serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config and built files
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
