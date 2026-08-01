# -------------------------------------------------
# 1️⃣ Builder stage – build the frontend (cached)
# -------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install only the necessary dependencies first
COPY package*.json ./
RUN npm ci

# Copy the source code and build it
COPY . ./
RUN npm run build

# -------------------------------------------------
# 2️⃣ Runtime stage – minimal web server
# -------------------------------------------------
FROM nginx:alpine

# Copy the built output from the builder stage
# Vite builds to 'dist' by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Overwrite the default NGINX configuration with our custom one
# This supports SPA routing correctly by redirecting to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
