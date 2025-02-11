FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json*  ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


EXPOSE 3003

ENV PORT 3003


CMD HOSTNAME="0.0.0.0" node server.js