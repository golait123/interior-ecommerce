FROM node:22-alpine
WORKDIR /app

# Copy Web package definition
COPY apps/web/package*.json ./
RUN npm install

# Copy source and config files
COPY apps/web/ ./

# Accept build arguments for environment variables
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

EXPOSE 5173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
