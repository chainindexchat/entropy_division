FROM node:20-alpine AS builder
ARG DOCKER_BUILD="1"
WORKDIR /app

# Increase Node.js memory for install phase
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY . . 

# Install pnpm
RUN corepack enable pnpm

# Install with network concurrency limit to reduce memory pressure
RUN pnpm install --frozen-lockfile --network-concurrency=3

# Makes the next output standalone
# https://github.com/vercel/next.js/discussions/65511
ENV NEXT_STANDALONE_OUTPUT="true"

# Disable SWC minifier for stability on Alpine ARM64
ENV NEXT_DISABLE_SWC_MINIFY="true"

# Build workspace dependencies first (midnight-contract is required)
RUN cd /app/packages/midnight-contract && pnpm run build && \
    cd /app/packages/midnight-ui && pnpm run build

RUN pnpm --filter chat-app build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the entire standalone output (includes monorepo structure with apps/chat-app)
COPY --from=builder --chown=nextjs:nodejs /app/apps/chat-app/.next/standalone ./

# Copy pnpm store (required for symlinked node_modules in standalone build)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm

# Copy static files to the correct location
COPY --from=builder --chown=nextjs:nodejs /app/apps/chat-app/.next/static ./apps/chat-app/.next/static

# Copy public directory  
COPY --from=builder /app/apps/chat-app/public ./apps/chat-app/public

# Copy migrations content
COPY --from=builder /app/apps/chat-app/src/lib/db/migrations ./apps/chat-app/src/lib/db/migrations

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"]
