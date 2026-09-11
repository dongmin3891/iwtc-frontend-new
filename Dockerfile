FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/.next/static ./.next/static
# Next.js standalone tracing includes sharp's JavaScript package but can omit
# the platform-specific Alpine binaries and their small runtime dependencies.
COPY --chown=node:node --from=build /app/node_modules/sharp ./node_modules/sharp
COPY --chown=node:node --from=build /app/node_modules/@img ./node_modules/@img
COPY --chown=node:node --from=build /app/node_modules/color ./node_modules/color
COPY --chown=node:node --from=build /app/node_modules/color-convert ./node_modules/color-convert
COPY --chown=node:node --from=build /app/node_modules/color-name ./node_modules/color-name
COPY --chown=node:node --from=build /app/node_modules/color-string ./node_modules/color-string
COPY --chown=node:node --from=build /app/node_modules/detect-libc ./node_modules/detect-libc
COPY --chown=node:node --from=build /app/node_modules/is-arrayish ./node_modules/is-arrayish
COPY --chown=node:node --from=build /app/node_modules/semver ./node_modules/semver
USER node
EXPOSE 3000
CMD ["node", "server.js"]
