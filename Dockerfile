# ==========================================
# Stage 1: Builder
# ==========================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency files first (for caching)
COPY package.json bun.lock ./

# Install ALL dependencies (including dev deps like vite, svelte)
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Prepare svelte (e.g. generate types, etc.)
RUN bun run prepare

# Build the SvelteKit app (outputs to /app/build)
RUN bun run build


# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
# Default port for SvelteKit Node adapter
ENV PORT=3000

# Install ONLY production dependencies to keep the image tiny
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy only the compiled app, the migrations, and the migration script
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY migrate.ts ./

# Create a directory for the SQLite database.
# This ensures we can mount a volume here and the 'bun' user can write to it.
# (SQLite needs folder write access for WAL/SHM files)
RUN mkdir -p /data && chown -R bun:bun /app && chown -R bun:bun /data

# Security: Switch to the built-in non-root "bun" user.
USER bun

# Point your db/index.ts to the persistent volume
ENV DB_FILE_NAME=/data/sqlite.db

EXPOSE 3000

# When the container starts:
# 1. Run the TypeScript migration script
# 2. If successful (&&), start the SvelteKit server using Bun
CMD ["sh", "-c", "bun run migrate.ts && bun run build/index.js"]
