import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/validation';

// Simple in-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  general: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  upload: { requests: 10, windowMs: 60 * 1000 },   // 10 requests per minute
  auth: { requests: 5, windowMs: 60 * 1000 }       // 5 requests per minute
};

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwarded ? forwarded.split(',')[0] : realIP;

  return clientIP || request.ip || 'unknown';
}

// Rate limiting middleware
export function rateLimit(type: 'general' | 'upload' | 'auth' = 'general') {
  return function(request: NextRequest) {
    const clientIP = getClientIP(request);
    const key = `${type}:${clientIP}`;
    const limit = RATE_LIMITS[type];
    const now = Date.now();

    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      // Reset or initialize counter
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + limit.windowMs
      });
      return null; // Allow request
    }

    if (current.count >= limit.requests) {
      // Rate limit exceeded
      return createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Increment counter
    current.count++;
    return null; // Allow request
  };
}

// CORS middleware
export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Allowed origins (in production, use environment variables)
  const allowedOrigins = [
    'http://localhost:9002',
    'https://ids-connector-portal.com'
  ];

  const isAllowed = !origin || allowedOrigins.includes(origin);

  if (!isAllowed) {
    return createErrorResponse(
      'CORS policy violation',
      403,
      'CORS_FORBIDDEN'
    );
  }

  return null; // Allow request
}

// Input sanitization
export function sanitizeRequestBody(body: any): any {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  const sanitized: any = Array.isArray(body) ? [] : {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      // Basic XSS prevention
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Security headers middleware
export function securityHeaders() {
  const headers = new Headers();

  // Basic security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CSP (Content Security Policy)
  headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:;"
  );

  return headers;
}

// SQL injection prevention (basic patterns)
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(\-\-)|(\#)|(\*)/gi,
    /('|(\\)|(\%27)|(\%25))/gi,
    /((\'|\%27)(\s)*(\;|\%3B))/gi,
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
    /((\%3C)|<)(img|script|object|embed|style)/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

// File upload security
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size ${file.size} exceeds maximum ${maxSize} bytes` };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = allowedTypes.map(type => {
    switch(type) {
      case 'application/json': return 'json';
      case 'text/csv': return 'csv';
      case 'application/geo+json': return 'geojson';
      default: return '';
    }
  }).filter(Boolean);

  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension .${extension} not allowed` };
  }

  return { valid: true };
}

// Authentication middleware (placeholder - implement with your auth system)
export function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse(
      'Authentication required',
      401,
      'AUTH_REQUIRED'
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // TODO: Implement actual JWT validation
  if (!token || token === 'invalid') {
    return createErrorResponse(
      'Invalid authentication token',
      401,
      'INVALID_TOKEN'
    );
  }

  return null; // Allow request
}

// Role-based authorization
export function requireRole(allowedRoles: string[]) {
  return function(request: NextRequest) {
    // TODO: Extract user role from validated JWT token
    const userRole = 'admin'; // Placeholder

    if (!allowedRoles.includes(userRole)) {
      return createErrorResponse(
        'Insufficient permissions',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    return null; // Allow request
  };
}

// Combine multiple middleware
export function combineMiddleware(...middlewares: Array<(req: NextRequest) => Response | null>) {
  return function(request: NextRequest) {
    for (const middleware of middlewares) {
      const result = middleware(request);
      if (result) {
        return result; // Return error response
      }
    }
    return null; // All middleware passed
  };
}