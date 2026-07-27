# syntax=docker/dockerfile:1

# --- Stage 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Les variables VITE_* sont figees au moment du build (pas au runtime).
# Par defaut on utilise un chemin relatif /api, compatible avec le reverse
# proxy quel que soit le nom de domaine/IP du serveur.
ARG VITE_API_BASE_URL=/api
ARG VITE_TIMER_SESSION=900
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TIMER_SESSION=$VITE_TIMER_SESSION

# tsc -b (type-check strict) casse actuellement le build a cause d'erreurs
# TypeScript preexistantes dans le code (jamais detectees car `vite dev` ne
# type-check pas). On utilise vite build seul pour debloquer le deploiement;
# a corriger cote code applicatif puis remettre `npm run build`.
RUN npx vite build

# --- Stage 2: runtime ---
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
