# Use modern Node.js runtime supporting native node:sqlite
FROM node:22-alpine

WORKDIR /app

# Copy package and project files
COPY package.json ./
COPY . .

# Run initial schema setup and database seeding
RUN node seed.js

# Expose web port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start TrustPG server
CMD ["node", "server.js"]
