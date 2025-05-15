# Stage 1: Install dependencies and build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If using yarn, copy yarn.lock
# COPY yarn.lock ./

# Install dependencies
# If using npm:
RUN npm install
# If using yarn:
# RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production image - copy built assets and run the app
FROM node:18-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# If you have a custom server, copy it too
# COPY --from=builder /app/server.js ./server.js

# Install production dependencies only
# If using npm:
RUN npm install --production
# If using yarn:
# RUN yarn install --production

# Expose the port the Next.js app runs on (default is 3000)
EXPOSE 3000

# Command to run the application
# This uses the default Next.js start script
CMD ["npm", "start"]

# If you have a custom server (e.g., server.js), you might use:
# CMD ["node", "server.js"] 