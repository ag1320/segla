# ---- deps stage ----
# Installs with `npm ci` against package-lock.json for a reproducible
# build, and --omit=dev so nodemon (a dev-only tool, moved to
# devDependencies) never ships to the image.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- runtime stage ----
# No bind mount in docker-compose.yaml for this service (see
# SERVER_MIGRATION.md) - the image's own code and node_modules are what
# actually run, matching how ui/Dockerfile already works. Editing
# server code locally requires `docker compose restart server` (or
# `docker compose up -d --build server` if package.json changed) to pick
# up changes - no live-reload in this container. For nodemon-based
# live-reload, run `npm run dev` directly on the host instead.
FROM node:24-alpine
WORKDIR /app
# Default only - docker-compose.yaml's env_file (.env) sets the real value
# per environment and overrides this at container start, so this is what
# the image falls back to if ever run standalone without an .env. Local
# .env correctly still says NODE_ENV=development and wins over this line
# when run via `docker-compose up` locally - see AUTH.md.
ENV NODE_ENV=production
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
EXPOSE 4001
USER node
CMD ["sh", "-c", "npx knex migrate:latest && node src/app.js"]
