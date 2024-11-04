FROM node:18 AS builder

WORKDIR /app
ENV NODE_ENV production
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

RUN npm install --production

ENV PORT 3100
EXPOSE 3100

CMD ["npm", "start"]
