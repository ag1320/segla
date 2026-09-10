# ---- Build stage ----
# Compiles the CRA app to static files. REACT_APP_API_BASE_URL must be
# passed as a build arg (not just an .env value) - CRA inlines REACT_APP_*
# vars at build time, and this stage is where that build happens now that
# we're serving a production build instead of the dev server. Changing
# this value requires a rebuild (docker compose build frontend), not just
# an .env edit + restart. See SERVER_MIGRATION.md Section 2.
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
# react-scripts 5's bundled webpack still hashes with MD4, which OpenSSL 3
# (default since Node 17) rejects - "error:0308010C:digital envelope
# routines::unsupported". Confirmed by actually building this image after
# bumping to node:24-alpine (2026-09-09) - not a hypothetical. This flag
# only affects this build-stage RUN, not the runtime serve stage below.
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# ---- Serve stage ----
# Serves the static build via `serve` instead of running `react-scripts
# start` (webpack-dev-server) indefinitely. The dev server rejects
# requests with an unrecognized Host header by default ("Invalid Host
# header") once this is reachable at a real domain through Caddy rather
# than localhost - this stage avoids that entirely, and is lighter/faster
# for an always-on deployment besides.
FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 4000
CMD ["serve", "-s", "build", "-l", "4000"]
