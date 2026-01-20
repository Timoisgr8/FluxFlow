# Use official Node.js slim alpine image for smaller size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files separately for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the frontend code
COPY . .

# Expose port that Vite listens on
EXPOSE 5173

# Default command to start Vite dev server
CMD ["npm", "run", "dev"]