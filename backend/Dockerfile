# -------------------------------------------------
# 1️⃣  Builder stage – install deps (cached)
# -------------------------------------------------
FROM node:18-alpine AS builder

# Set a deterministic working directory inside the image
WORKDIR /app

# ----- Install only production dependencies (no dev deps) -----
#   • copy the manifests first → Docker can cache this layer until they change
COPY package*.json ./

#   • npm ci installs exactly what is locked in package‑lock.json
#   • --omit=dev skips nodemon, etc., shrinking node_modules
RUN npm ci --omit=dev && \
    # verify that the install succeeded (optional but handy)
    node -e "console.log('✅ node_modules installed')"

# ----- Copy source code (this invalidates cache only when files change) -----
COPY . ./

# Create the uploads folder so the path exists at runtime
RUN mkdir -p uploads

# -------------------------------------------------
# 2️⃣  Runtime stage – minimal, non‑root image
# -------------------------------------------------
FROM node:18-alpine AS runtime

# Set production env by default (can be overridden at run‑time)
ENV NODE_ENV=production

# Create a non‑root user/group (uid 1001 is a convention for app users)
#   • addgroup –g 1001 appgroup
#   • adduser  –D –u 1001 –G appgroup appuser
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Working directory (must match the builder stage)
WORKDIR /app

# ----- Copy only what we need from the builder -----
#   • node_modules (production only)
#   • compiled source (no .git, no docs, no dev files)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Ensure the uploads directory is owned by the non‑root user
RUN chown -R appuser:appgroup uploads

# Switch to the non‑root user for the rest of the build and at runtime
USER appuser

# Expose the port the app listens on (default 5000, can be overridden)
EXPOSE 5000

# Health‑check – Docker will poll this endpoint to know if the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Default command – start the server (uses the script defined in package.json)
CMD ["npm", "start"]
