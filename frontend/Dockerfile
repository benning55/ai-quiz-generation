FROM node:18-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package*.json yarn.lock* ./

# Install dependencies with yarn
RUN yarn install

# No need to copy source code in dev mode
# The source code is mounted as a volume in docker-compose.yml

# Expose the port Next.js will run on
EXPOSE 3000

# Command will be overridden in docker-compose.yml
CMD ["yarn", "dev"] 