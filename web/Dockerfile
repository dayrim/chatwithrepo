# Builder stage
FROM node:20-alpine AS builder
RUN apk update
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune web --docker

# Installer stage
FROM node:20-alpine AS installer
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder /app/turbo.json ./turbo.json
RUN yarn install --frozen-lockfile

# Sourcer stage, similar to the installer but prepares the full application
FROM node:20-alpine AS sourcer
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
RUN yarn turbo run build --filter=web --scope=web --include-dependencies --no-deps

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

# Setting the Next.js specific files and directories
COPY --from=sourcer /app/web/next.config.js .
COPY --from=sourcer /app/web/package.json .
COPY --from=sourcer /app/web/.next/standalone ./
COPY --from=sourcer /app/web/.next/static ./web/.next/static
COPY --from=sourcer /app/web/public ./web/public

CMD ["node", "web/server.js"]
