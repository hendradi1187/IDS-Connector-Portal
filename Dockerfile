# Dockerfile

# Tahap 1: Builder - Membangun aplikasi
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy skema Prisma terlebih dahulu
COPY prisma ./prisma/

# Copy sisa source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build aplikasi Next.js
RUN npm run build

# Hapus devDependencies untuk mengurangi ukuran
RUN npm prune --production

# Tahap 2: Runner - Menjalankan aplikasi
FROM node:18-alpine AS runner
WORKDIR /app

# Buat direktori public terlebih dahulu
RUN mkdir -p ./public && chown node:node ./public

# Set user non-root untuk keamanan
USER node

# Copy dependencies dari tahap builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
# Copy hasil build Next.js
COPY --from=builder --chown=node:node /app/.next ./.next
# Copy file public jika ada
COPY --from=builder --chown=node:node /app/public/ ./public/
# Copy package.json
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Expose port yang digunakan oleh Next.js
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
