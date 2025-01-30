FROM node:lts-alpine

ARG KEY1
ARG KEY2

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Run tests
RUN pnpm test

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Use non-root user
RUN chown -R node /usr/src/app
USER node

ENV KEY1=${KEY1}
ENV KEY2=${KEY2}

# Start the application
CMD ["pnpm", "start"]
