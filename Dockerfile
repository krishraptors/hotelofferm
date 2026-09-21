# ---- deps: install all dependencies (needed for the TypeScript build) ----
FROM node:20-bookworm-slim AS deps
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install

# ---- build: compile TypeScript to JS ----
FROM node:20-bookworm-slim AS build
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- prod-deps: install only production dependencies ----
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# ---- runtime: minimal final image ----
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package.json ./

EXPOSE 3000

# Overridden by docker-compose for the worker service.
CMD ["node", "dist/server.js"]
