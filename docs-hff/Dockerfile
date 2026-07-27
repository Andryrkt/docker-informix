
# --- Stage 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: runtime ---
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/build /usr/share/nginx/html/docs
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
