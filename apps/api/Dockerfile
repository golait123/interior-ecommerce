FROM node:22-alpine
WORKDIR /app

# Copy API package definition
COPY apps/api/package*.json ./
RUN npm install

# Copy configuration, prisma schema and source files
COPY apps/api/tsconfig.json ./
COPY apps/api/prisma ./prisma
COPY apps/api/src ./src

RUN npx prisma generate && npm run build

EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/src/server.js"]
