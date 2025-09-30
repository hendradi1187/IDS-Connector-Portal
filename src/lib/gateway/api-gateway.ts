import { z } from 'zod';

export interface RouteConfig {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  targetUrl: string;
  authentication: AuthenticationConfig;
  rateLimit?: RateLimitConfig;
  transformation?: TransformationConfig;
  validation?: ValidationConfig;
  caching?: CachingConfig;
  monitoring?: MonitoringConfig;
  enabled: boolean;
}

export interface AuthenticationConfig {
  required: boolean;
  type: 'bearer' | 'api-key' | 'oauth2' | 'basic' | 'jwt' | 'mutual-tls';
  scopes?: string[];
  roles?: string[];
  customValidation?: string; // Function name for custom validation
}

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: 'ip' | 'user' | 'api-key' | 'custom';
}

export interface TransformationConfig {
  requestTransform?: {
    headers?: Record<string, string>;
    body?: string; // JSON transformation template
    queryParams?: Record<string, string>;
  };
  responseTransform?: {
    headers?: Record<string, string>;
    body?: string; // JSON transformation template
    statusCodeMapping?: Record<number, number>;
  };
}

export interface ValidationConfig {
  requestSchema?: z.ZodSchema;
  responseSchema?: z.ZodSchema;
  validateHeaders?: boolean;
  validateQueryParams?: boolean;
  validateBody?: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number; // seconds
  key?: string; // Cache key template
  varyBy?: string[]; // Headers/params to vary cache by
  conditions?: string[]; // Conditions for caching
}

export interface MonitoringConfig {
  logRequests: boolean;
  logResponses: boolean;
  metricsEnabled: boolean;
  alerting?: AlertConfig[];
}

export interface AlertConfig {
  id: string;
  condition: 'error-rate' | 'response-time' | 'request-count';
  threshold: number;
  window: number; // seconds
  action: 'email' | 'webhook' | 'sms';
  target: string;
}

export interface RequestMetrics {
  requestId: string;
  route: string;
  method: string;
  timestamp: Date;
  duration: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  clientIp: string;
  userId?: string;
  errors?: string[];
}

export interface GatewayMiddleware {
  name: string;
  order: number;
  execute: (request: GatewayRequest, response: GatewayResponse, next: () => Promise<void>) => Promise<void>;
}

export interface GatewayRequest {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: any;
  user?: any;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface GatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: any;
  metadata: Record<string, any>;
}

class APIGatewayService {
  private routes: Map<string, RouteConfig> = new Map();
  private middleware: GatewayMiddleware[] = [];
  private metrics: RequestMetrics[] = [];
  private cache: Map<string, { data: any; expires: Date }> = new Map();
  private rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();

  constructor() {
    this.initializeDefaultMiddleware();
  }

  private initializeDefaultMiddleware(): void {
    this.addMiddleware({
      name: 'request-id',
      order: 1,
      execute: async (req, res, next) => {
        req.id = crypto.randomUUID();
        await next();
      }
    });

    this.addMiddleware({
      name: 'cors',
      order: 2,
      execute: async (req, res, next) => {
        res.headers['Access-Control-Allow-Origin'] = '*';
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        await next();
      }
    });

    this.addMiddleware({
      name: 'security-headers',
      order: 3,
      execute: async (req, res, next) => {
        res.headers['X-Content-Type-Options'] = 'nosniff';
        res.headers['X-Frame-Options'] = 'DENY';
        res.headers['X-XSS-Protection'] = '1; mode=block';
        res.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
        await next();
      }
    });

    this.addMiddleware({
      name: 'rate-limiting',
      order: 4,
      execute: async (req, res, next) => {
        const route = this.findRoute(req.path, req.method);
        if (route?.rateLimit) {
          const allowed = await this.checkRateLimit(req, route.rateLimit);
          if (!allowed) {
            res.statusCode = 429;
            res.body = { error: 'Rate limit exceeded' };
            return;
          }
        }
        await next();
      }
    });

    this.addMiddleware({
      name: 'authentication',
      order: 5,
      execute: async (req, res, next) => {
        const route = this.findRoute(req.path, req.method);
        if (route?.authentication.required) {
          const authenticated = await this.authenticateRequest(req, route.authentication);
          if (!authenticated) {
            res.statusCode = 401;
            res.body = { error: 'Authentication required' };
            return;
          }
        }
        await next();
      }
    });

    this.addMiddleware({
      name: 'validation',
      order: 6,
      execute: async (req, res, next) => {
        const route = this.findRoute(req.path, req.method);
        if (route?.validation) {
          const valid = await this.validateRequest(req, route.validation);
          if (!valid.success) {
            res.statusCode = 400;
            res.body = { error: 'Validation failed', details: valid.errors };
            return;
          }
        }
        await next();
      }
    });

    this.addMiddleware({
      name: 'caching',
      order: 7,
      execute: async (req, res, next) => {
        const route = this.findRoute(req.path, req.method);
        if (route?.caching?.enabled && req.method === 'GET') {
          const cached = this.getCachedResponse(req, route.caching);
          if (cached) {
            res.statusCode = 200;
            res.body = cached;
            res.headers['X-Cache'] = 'HIT';
            return;
          }
        }
        await next();
      }
    });
  }

  addRoute(route: RouteConfig): void {
    this.routes.set(`${route.method}:${route.path}`, route);
  }

  removeRoute(path: string, method: string): void {
    this.routes.delete(`${method}:${path}`);
  }

  addMiddleware(middleware: GatewayMiddleware): void {
    this.middleware.push(middleware);
    this.middleware.sort((a, b) => a.order - b.order);
  }

  private findRoute(path: string, method: string): RouteConfig | undefined {
    const exactMatch = this.routes.get(`${method}:${path}`);
    if (exactMatch) return exactMatch;

    // Pattern matching for dynamic routes
    for (const [key, route] of this.routes) {
      if (key.startsWith(`${method}:`)) {
        const routePath = key.substring(method.length + 1);
        if (this.matchPath(routePath, path)) {
          return route;
        }
      }
    }

    return undefined;
  }

  private matchPath(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return false;

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':') || patternPart === '*') {
        continue;
      }

      if (patternPart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  private async checkRateLimit(request: GatewayRequest, config: RateLimitConfig): Promise<boolean> {
    const key = this.generateRateLimitKey(request, config.keyGenerator || 'ip');
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.window * 1000);

    const current = this.rateLimitStore.get(key);
    if (!current || current.resetTime < now) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: new Date(now.getTime() + config.window * 1000)
      });
      return true;
    }

    if (current.count >= config.requests) {
      return false;
    }

    current.count++;
    return true;
  }

  private generateRateLimitKey(request: GatewayRequest, generator: string): string {
    switch (generator) {
      case 'ip':
        return `rate_limit:${request.metadata.clientIp}`;
      case 'user':
        return `rate_limit:${request.user?.id || 'anonymous'}`;
      case 'api-key':
        return `rate_limit:${request.headers['x-api-key'] || 'no-key'}`;
      default:
        return `rate_limit:${request.metadata.clientIp}`;
    }
  }

  private async authenticateRequest(request: GatewayRequest, config: AuthenticationConfig): Promise<boolean> {
    switch (config.type) {
      case 'bearer':
        const token = request.headers.authorization?.replace('Bearer ', '');
        return this.validateBearerToken(token, config);

      case 'api-key':
        const apiKey = request.headers['x-api-key'];
        return this.validateApiKey(apiKey, config);

      case 'jwt':
        const jwtToken = request.headers.authorization?.replace('Bearer ', '');
        return this.validateJwtToken(jwtToken, config);

      case 'oauth2':
        return this.validateOAuth2Token(request, config);

      case 'basic':
        const authHeader = request.headers.authorization;
        return this.validateBasicAuth(authHeader, config);

      case 'mutual-tls':
        return this.validateMutualTLS(request, config);

      default:
        return false;
    }
  }

  private async validateBearerToken(token: string | undefined, config: AuthenticationConfig): Promise<boolean> {
    if (!token) return false;
    // Implementation would validate against token store/database
    return token.length > 0; // Simplified validation
  }

  private async validateApiKey(apiKey: string | undefined, config: AuthenticationConfig): Promise<boolean> {
    if (!apiKey) return false;
    // Implementation would validate against API key store/database
    return apiKey.length > 0; // Simplified validation
  }

  private async validateJwtToken(token: string | undefined, config: AuthenticationConfig): Promise<boolean> {
    if (!token) return false;
    // Implementation would validate JWT signature and claims
    return token.length > 0; // Simplified validation
  }

  private async validateOAuth2Token(request: GatewayRequest, config: AuthenticationConfig): Promise<boolean> {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;
    // Implementation would validate OAuth2 token with authorization server
    return true;
  }

  private async validateBasicAuth(authHeader: string | undefined, config: AuthenticationConfig): Promise<boolean> {
    if (!authHeader?.startsWith('Basic ')) return false;
    // Implementation would decode and validate credentials
    return true;
  }

  private async validateMutualTLS(request: GatewayRequest, config: AuthenticationConfig): Promise<boolean> {
    // Implementation would validate client certificate
    return request.metadata.clientCertificate !== undefined;
  }

  private async validateRequest(request: GatewayRequest, config: ValidationConfig): Promise<{ success: boolean; errors?: any[] }> {
    const errors: any[] = [];

    if (config.validateBody && config.requestSchema && request.body) {
      const result = config.requestSchema.safeParse(request.body);
      if (!result.success) {
        errors.push(...result.error.issues);
      }
    }

    if (config.validateQueryParams && request.query) {
      // Validate query parameters
    }

    if (config.validateHeaders && request.headers) {
      // Validate headers
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private getCachedResponse(request: GatewayRequest, config: CachingConfig): any {
    const key = this.generateCacheKey(request, config);
    const cached = this.cache.get(key);

    if (cached && cached.expires > new Date()) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  private generateCacheKey(request: GatewayRequest, config: CachingConfig): string {
    let key = `${request.method}:${request.path}`;

    if (config.varyBy) {
      for (const vary of config.varyBy) {
        if (request.headers[vary]) {
          key += `:${vary}=${request.headers[vary]}`;
        }
      }
    }

    return key;
  }

  private setCacheResponse(request: GatewayRequest, response: any, config: CachingConfig): void {
    const key = this.generateCacheKey(request, config);
    const expires = new Date(Date.now() + config.ttl * 1000);

    this.cache.set(key, {
      data: response,
      expires
    });
  }

  async processRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const response: GatewayResponse = {
      statusCode: 200,
      headers: {},
      metadata: {}
    };

    const startTime = Date.now();

    try {
      // Execute middleware chain
      let middlewareIndex = 0;
      const next = async (): Promise<void> => {
        if (middlewareIndex < this.middleware.length) {
          const middleware = this.middleware[middlewareIndex++];
          await middleware.execute(request, response, next);
        } else {
          // Execute actual request processing
          await this.executeRequest(request, response);
        }
      };

      await next();

      // Handle caching for successful responses
      const route = this.findRoute(request.path, request.method);
      if (route?.caching?.enabled && response.statusCode === 200) {
        this.setCacheResponse(request, response.body, route.caching);
      }

    } catch (error) {
      response.statusCode = 500;
      response.body = { error: 'Internal server error' };
      console.error('Gateway error:', error);
    }

    // Record metrics
    const metrics: RequestMetrics = {
      requestId: request.id,
      route: request.path,
      method: request.method,
      timestamp: request.timestamp,
      duration: Date.now() - startTime,
      statusCode: response.statusCode,
      requestSize: JSON.stringify(request.body || '').length,
      responseSize: JSON.stringify(response.body || '').length,
      clientIp: request.metadata.clientIp,
      userId: request.user?.id,
      errors: response.statusCode >= 400 ? ['Request failed'] : undefined
    };

    this.metrics.push(metrics);
    this.checkAlerts(metrics);

    return response;
  }

  private async executeRequest(request: GatewayRequest, response: GatewayResponse): Promise<void> {
    const route = this.findRoute(request.path, request.method);

    if (!route || !route.enabled) {
      response.statusCode = 404;
      response.body = { error: 'Route not found' };
      return;
    }

    // Transform request if configured
    if (route.transformation?.requestTransform) {
      this.transformRequest(request, route.transformation.requestTransform);
    }

    // Forward request to target service
    const targetResponse = await this.forwardRequest(request, route);

    // Transform response if configured
    if (route.transformation?.responseTransform) {
      this.transformResponse(targetResponse, route.transformation.responseTransform);
    }

    response.statusCode = targetResponse.statusCode;
    response.body = targetResponse.body;
    response.headers = { ...response.headers, ...targetResponse.headers };
  }

  private transformRequest(request: GatewayRequest, transform: NonNullable<TransformationConfig['requestTransform']>): void {
    if (transform.headers) {
      Object.assign(request.headers, transform.headers);
    }

    if (transform.queryParams) {
      Object.assign(request.query, transform.queryParams);
    }

    // JSON transformation would be implemented here
  }

  private transformResponse(response: any, transform: NonNullable<TransformationConfig['responseTransform']>): void {
    if (transform.headers) {
      Object.assign(response.headers, transform.headers);
    }

    if (transform.statusCodeMapping && transform.statusCodeMapping[response.statusCode]) {
      response.statusCode = transform.statusCodeMapping[response.statusCode];
    }

    // JSON transformation would be implemented here
  }

  private async forwardRequest(request: GatewayRequest, route: RouteConfig): Promise<any> {
    // This would implement actual HTTP forwarding to the target service
    // For now, return a mock response
    return {
      statusCode: 200,
      headers: {},
      body: { message: 'Forwarded request', route: route.id }
    };
  }

  private checkAlerts(metrics: RequestMetrics): void {
    // Implementation would check alert conditions and trigger notifications
  }

  getMetrics(filters?: {
    route?: string;
    method?: string;
    timeRange?: { start: Date; end: Date };
    statusCode?: number
  }): RequestMetrics[] {
    let filtered = this.metrics;

    if (filters) {
      if (filters.route) {
        filtered = filtered.filter(m => m.route === filters.route);
      }
      if (filters.method) {
        filtered = filtered.filter(m => m.method === filters.method);
      }
      if (filters.timeRange) {
        filtered = filtered.filter(m =>
          m.timestamp >= filters.timeRange!.start &&
          m.timestamp <= filters.timeRange!.end
        );
      }
      if (filters.statusCode) {
        filtered = filtered.filter(m => m.statusCode === filters.statusCode);
      }
    }

    return filtered;
  }

  getRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  updateRoute(routeId: string, updates: Partial<RouteConfig>): void {
    for (const [key, route] of this.routes) {
      if (route.id === routeId) {
        this.routes.set(key, { ...route, ...updates });
        break;
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export { APIGatewayService };