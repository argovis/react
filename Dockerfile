# ---------------------------------------------------------------------------
# base: dependencies + source. Everything is pinned by argovis/package-lock.json,
# so `npm ci` installs exactly the same tree on every build.
# ---------------------------------------------------------------------------
FROM node:22-bookworm AS base

WORKDIR /react/argovis

# Install dependencies first so source edits don't invalidate this layer.
COPY argovis/package.json argovis/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY argovis/.env .env
COPY argovis/src src
COPY argovis/public public

# ---------------------------------------------------------------------------
# dev: hot-reloading dev server. See README for the bind-mount invocation.
# ---------------------------------------------------------------------------
FROM base AS dev
CMD ["npm", "start"]

# ---------------------------------------------------------------------------
# build: compile the static site, and fetch supercronic here (this image has
# curl) so the runtime image below needs no apt at all.
# ---------------------------------------------------------------------------
FROM base AS build
RUN npm run build

# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.30/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=9f27ad28c5c57cd133325b2a66bba69ba2235799
RUN curl -fsSL --retry 5 --retry-delay 5 -o "/usr/local/bin/${SUPERCRONIC}" "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  /usr/local/bin/${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "/usr/local/bin/${SUPERCRONIC}"

# ---------------------------------------------------------------------------
# prod: static files + `serve` + supercronic for the nightly sitemap job.
# No node_modules, no build toolchain. Paths match the old image so crontab,
# entrypoint.sh and generate_argo_sitemap.sh are unchanged.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS prod

RUN npm install -g serve --no-audit --no-fund

WORKDIR /react/argovis
COPY --from=build /react/argovis/build build
COPY --from=build /usr/local/bin/supercronic-linux-amd64 /usr/local/bin/supercronic-linux-amd64
RUN ln -s /usr/local/bin/supercronic-linux-amd64 /usr/local/bin/supercronic

COPY crontab entrypoint.sh generate_argo_sitemap.sh ./

# OpenShift runs the container as an arbitrary UID; the sitemap job writes into build/.
RUN chmod +x generate_argo_sitemap.sh && chown -R 1000660000 /react/argovis
USER 1000660000
CMD ["bash", "entrypoint.sh"]
