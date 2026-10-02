FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && pnpm prune --prod
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "start"]
