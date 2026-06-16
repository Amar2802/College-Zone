# Production Docker Multi-Stage Build for Express Backend
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Release image stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app /usr/src/app

EXPOSE 5000

CMD ["npm", "start"]
