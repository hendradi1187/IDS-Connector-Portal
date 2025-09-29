import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a lazy initialization function to avoid build-time issues
let _prisma: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma;

  if (globalForPrisma.prisma) {
    _prisma = globalForPrisma.prisma;
    return _prisma;
  }

  try {
    _prisma = new PrismaClient({
      log: ['query'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma;
    }

    return _prisma;
  } catch (error) {
    // During build time, database might not be available
    // Return a mock client that will throw descriptive errors at runtime
    console.warn('Prisma client initialization failed during build:', error);
    throw new Error('Database not available during build process');
  }
}

// Export a proxy object that initializes Prisma lazily
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];

    if (typeof value === 'function') {
      return value.bind(client);
    }

    return value;
  }
});

export default prisma;