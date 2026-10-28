# Multi-stage Dockerfile for AgriPulse AI Frontend
# Stage 1: Build the Vite React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Build production bundle
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve using high-performance Nginx
FROM nginx:alpine

# Remove default nginx config and copy custom reverse-proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
