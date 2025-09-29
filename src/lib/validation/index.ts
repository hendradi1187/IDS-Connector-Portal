import { NextRequest } from 'next/server';
import { z } from 'zod';

// Schema for External Services
export const externalServiceCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  serviceType: z.enum(['IDS_BROKER', 'DATA_CATALOG', 'AUTHENTICATION', 'MONITORING', 'ANALYTICS']),
  endpoint: z.string().url('Must be a valid URL'),
  authType: z.enum(['API_KEY', 'OAUTH2', 'BASIC_AUTH', 'CERTIFICATE', 'NONE']),
  credentials: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'error', 'syncing']).optional(),
  syncInterval: z.number().min(1).max(1440).optional(), // 1 minute to 24 hours
  metadata: z.record(z.any()).optional()
});

export const externalServiceQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'error', 'syncing']).optional(),
  serviceType: z.enum(['IDS_BROKER', 'DATA_CATALOG', 'AUTHENTICATION', 'MONITORING', 'ANALYTICS']).optional(),
  authType: z.enum(['API_KEY', 'OAUTH2', 'BASIC_AUTH', 'CERTIFICATE', 'NONE']).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 500, 'Limit must be 1-500').optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Offset must be >= 0').optional()
});

// Schema for Routing Services
export const routingServiceCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  routingType: z.enum(['ROUND_ROBIN', 'WEIGHTED', 'FAILOVER', 'RANDOM']),
  priority: z.number().min(0).max(100).optional(),
  loadBalancing: z.enum(['ROUND_ROBIN', 'LEAST_CONNECTIONS', 'IP_HASH', 'WEIGHTED_ROUND_ROBIN']),
  healthCheck: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  configuration: z.record(z.any()).optional()
});

export const routingServiceQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'error']).optional(),
  routingType: z.enum(['ROUND_ROBIN', 'WEIGHTED', 'FAILOVER', 'RANDOM']).optional(),
  loadBalancing: z.enum(['ROUND_ROBIN', 'LEAST_CONNECTIONS', 'IP_HASH', 'WEIGHTED_ROUND_ROBIN']).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 500).optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0).optional()
});

// Schema for Data Routes
export const routeCreateSchema = z.object({
  providerId: z.string().uuid('Must be valid UUID'),
  consumerId: z.string().uuid('Must be valid UUID'),
  resourceId: z.string().uuid('Must be valid UUID'),
  status: z.enum(['active', 'inactive']).optional(),
  validUntil: z.string().datetime().optional().refine(
    (date) => !date || new Date(date) > new Date(),
    'Valid until date must be in the future'
  )
});

export const routeQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  providerId: z.string().uuid().optional(),
  consumerId: z.string().uuid().optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 500).optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0).optional()
});

// Schema for Resources
export const resourceQuerySchema = z.object({
  type: z.enum(['GeoJSON', 'CSV', 'WellData']).optional(),
  providerId: z.string().uuid().optional(),
  accessPolicy: z.enum(['restricted', 'public', 'contractOnly']).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 500).optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0).optional()
});

// Schema for Users
export const userQuerySchema = z.object({
  role: z.enum(['admin', 'provider', 'consumer']).optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 500).optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0).optional()
});

// Schema for System Logs
export const systemLogsQuerySchema = z.object({
  service: z.string().min(1).max(100).optional(),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
  userId: z.string().uuid().optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 500, 'Limit must be 1-500').optional(),
  offset: z.string().transform(val => parseInt(val)).refine(val => val >= 0, 'Offset must be >= 0').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Generic validation helper
export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(searchParams);
    const result = schema.parse(params);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}

export function validateBody<T extends z.ZodSchema>(
  schema: T,
  body: any
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const result = schema.parse(body);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid request body' };
  }
}

// Security validation helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validatePagination(limit?: number, offset?: number) {
  const finalLimit = Math.min(limit || 50, 500);
  const finalOffset = Math.max(offset || 0, 0);
  return { limit: finalLimit, offset: finalOffset };
}

// Error response helper
export function createErrorResponse(message: string, statusCode = 400, code?: string) {
  return Response.json(
    {
      error: message,
      code: code || 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}