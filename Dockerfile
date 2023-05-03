FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Start the bot
CMD ["./run.sh"]
