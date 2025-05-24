FROM node:22-slim as builder

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y python3 make g++ libtool autoconf automake

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

RUN npm prune --production

FROM node:22-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y ffmpeg

ENV NODE_ENV=production

COPY --from=builder /app/assets ./assets/
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/run.sh ./run.sh

# Start the bot
CMD ["./run.sh"]
