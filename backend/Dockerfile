FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER appuser
CMD ["nodemon", "server.js"]
