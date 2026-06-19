# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Set environment variables to avoid unnecessary downloads during install
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

# Copy package files
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (Vite + Express server)
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
