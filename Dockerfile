FROM node:lts-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Use non-root user
RUN chown -R node /usr/src/app
USER node

# Start the application
CMD ["pnpm", "start"]
