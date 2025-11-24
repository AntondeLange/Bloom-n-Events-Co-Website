FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all backend files
COPY backend/ ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

