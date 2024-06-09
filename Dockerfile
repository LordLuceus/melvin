FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache python3 make g++ libtool autoconf automake

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production

COPY --from=builder /app ./

# Start the bot
CMD ["./run.sh"]
