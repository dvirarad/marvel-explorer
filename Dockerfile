FROM node:18-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package.json and install dependencies
COPY ./marvel-explorer-backend/package*.json ./
RUN npm install

# Copy backend source code
COPY ./marvel-explorer-backend/ ./

# Build the backend
RUN npm run build

FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package.json and install dependencies
COPY ./marvel-explorer-frontend/package*.json ./
RUN npm install

# Copy frontend source code
COPY ./marvel-explorer-frontend/ ./

# Set environment variables for build
ARG REACT_APP_API_URL=http://localhost:3001
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx

# Copy backend build
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY ./marvel-explorer-backend/package*.json ./backend/

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy Nginx config - we'll make this directly in the image
RUN mkdir -p /etc/nginx/http.d/
COPY ./docker/nginx.conf /etc/nginx/http.d/default.conf

# Create a wrapper script to start both services
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'cd /app/backend && node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 10000

# Print the content of the start script for debugging
RUN cat /app/start.sh

# Start the services
CMD ["/bin/sh", "/app/start.sh"]
