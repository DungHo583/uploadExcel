FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile;

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build;

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# RUN mkdir .next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT 3100
EXPOSE 3100

CMD ["node", "server.js"]
# CMD ["npm", "start"]
