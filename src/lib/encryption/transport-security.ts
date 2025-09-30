import { z } from 'zod';

export interface TLSConfig {
  version: '1.2' | '1.3';
  cipherSuites: string[];
  certificatePath: string;
  privateKeyPath: string;
  caPath?: string;
  verifyClient: boolean;
  sessionResumption: boolean;
  ocspStapling: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  enforceHTTPS: boolean;
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  contentSecurityPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  requestValidation: {
    maxRequestSize: number;
    allowedMethods: string[];
    allowedHeaders: string[];
    blockedUserAgents: string[];
    blockedIPs: string[];
  };
  rateLimiting: {
    enabled: boolean;
    requests: number;
    window: number; // seconds
    skipSuccessfulRequests: boolean;
  };
}

export interface SecurityHeaders {
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'blocked-request' | 'certificate-error' | 'rate-limit-exceeded' | 'malicious-activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  metadata: Record<string, any>;
  remediation?: string;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  fingerprint: string;
  keyUsage: string[];
  extendedKeyUsage: string[];
  subjectAltNames: string[];
  isValidChain: boolean;
  isRevoked: boolean;
}

class TransportSecurityService {
  private policies: Map<string, SecurityPolicy> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private certificates: Map<string, CertificateInfo> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivity: Map<string, { count: number; lastSeen: Date }> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
    this.startSecurityMonitoring();
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicy: SecurityPolicy = {
      id: 'default',
      name: 'Default Security Policy',
      enforceHTTPS: true,
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      contentSecurityPolicy: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'"],
          'font-src': ["'self'"],
          'object-src': ["'none'"],
          'media-src': ["'self'"],
          'frame-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"]
        }
      },
      requestValidation: {
        maxRequestSize: 10 * 1024 * 1024, // 10MB
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Accept',
          'Accept-Language',
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'X-API-Key'
        ],
        blockedUserAgents: [
          'bot',
          'crawler',
          'scanner',
          'curl',
          'wget'
        ],
        blockedIPs: []
      },
      rateLimiting: {
        enabled: true,
        requests: 100,
        window: 60,
        skipSuccessfulRequests: false
      }
    };

    this.policies.set('default', defaultPolicy);
  }

  createSecurityPolicy(policy: SecurityPolicy): void {
    this.policies.set(policy.id, policy);
  }

  getSecurityPolicy(policyId: string): SecurityPolicy | undefined {
    return this.policies.get(policyId);
  }

  generateSecurityHeaders(policyId: string = 'default'): SecurityHeaders {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Security policy ${policyId} not found`);
    }

    const headers: SecurityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    } as SecurityHeaders;

    if (policy.hsts.enabled) {
      let hstsValue = `max-age=${policy.hsts.maxAge}`;
      if (policy.hsts.includeSubDomains) hstsValue += '; includeSubDomains';
      if (policy.hsts.preload) hstsValue += '; preload';
      headers['Strict-Transport-Security'] = hstsValue;
    }

    if (policy.contentSecurityPolicy.enabled) {
      const cspDirectives = Object.entries(policy.contentSecurityPolicy.directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
      headers['Content-Security-Policy'] = cspDirectives;
    }

    return headers;
  }

  validateRequest(request: {
    method: string;
    headers: Record<string, string>;
    body?: any;
    ip: string;
    userAgent?: string;
  }, policyId: string = 'default'): { valid: boolean; reason?: string; blocked?: boolean } {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return { valid: false, reason: 'Policy not found' };
    }

    // Check if IP is blocked
    if (this.blockedIPs.has(request.ip) || policy.requestValidation.blockedIPs.includes(request.ip)) {
      this.logSecurityEvent({
        type: 'blocked-request',
        severity: 'high',
        source: request.ip,
        target: 'server',
        description: 'Request from blocked IP address',
        metadata: { ip: request.ip, method: request.method }
      });
      return { valid: false, reason: 'IP address blocked', blocked: true };
    }

    // Check method
    if (!policy.requestValidation.allowedMethods.includes(request.method)) {
      return { valid: false, reason: `Method ${request.method} not allowed` };
    }

    // Check headers
    for (const header of Object.keys(request.headers)) {
      const headerLower = header.toLowerCase();
      const allowed = policy.requestValidation.allowedHeaders.some(h =>
        h.toLowerCase() === headerLower
      );
      if (!allowed && !headerLower.startsWith('x-forwarded-')) {
        return { valid: false, reason: `Header ${header} not allowed` };
      }
    }

    // Check user agent
    if (request.userAgent) {
      const isBlocked = policy.requestValidation.blockedUserAgents.some(ua =>
        request.userAgent!.toLowerCase().includes(ua.toLowerCase())
      );
      if (isBlocked) {
        this.logSecurityEvent({
          type: 'blocked-request',
          severity: 'medium',
          source: request.ip,
          target: 'server',
          description: 'Request from blocked user agent',
          metadata: { userAgent: request.userAgent, ip: request.ip }
        });
        return { valid: false, reason: 'User agent blocked', blocked: true };
      }
    }

    // Check request size
    if (request.body) {
      const size = JSON.stringify(request.body).length;
      if (size > policy.requestValidation.maxRequestSize) {
        return { valid: false, reason: 'Request size exceeds limit' };
      }
    }

    // Check for suspicious activity
    this.trackSuspiciousActivity(request.ip);

    return { valid: true };
  }

  private trackSuspiciousActivity(ip: string): void {
    const activity = this.suspiciousActivity.get(ip) || { count: 0, lastSeen: new Date() };
    activity.count++;
    activity.lastSeen = new Date();
    this.suspiciousActivity.set(ip, activity);

    // Block IP if too many requests in short time
    if (activity.count > 1000) { // Configurable threshold
      this.blockedIPs.add(ip);
      this.logSecurityEvent({
        type: 'malicious-activity',
        severity: 'critical',
        source: ip,
        target: 'server',
        description: 'IP blocked due to suspicious activity',
        metadata: { requestCount: activity.count, timeWindow: '1 hour' }
      });
    }
  }

  configureTLS(config: TLSConfig): { configuration: string; securityLevel: 'high' | 'medium' | 'low' } {
    const strongCiphers = [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256'
    ];

    const weakCiphers = [
      'TLS_RSA_WITH_AES_128_CBC_SHA',
      'TLS_RSA_WITH_AES_256_CBC_SHA',
      'TLS_RSA_WITH_3DES_EDE_CBC_SHA'
    ];

    let securityLevel: 'high' | 'medium' | 'low' = 'high';

    // Check cipher strength
    const hasWeakCiphers = config.cipherSuites.some(cipher =>
      weakCiphers.some(weak => cipher.includes(weak))
    );

    const hasOnlyStrongCiphers = config.cipherSuites.every(cipher =>
      strongCiphers.some(strong => cipher.includes(strong))
    );

    if (hasWeakCiphers) {
      securityLevel = 'low';
    } else if (!hasOnlyStrongCiphers) {
      securityLevel = 'medium';
    }

    // Check TLS version
    if (config.version === '1.2') {
      securityLevel = securityLevel === 'high' ? 'medium' : securityLevel;
    }

    const tlsConfiguration = {
      version: config.version,
      cipherSuites: config.cipherSuites,
      verifyClient: config.verifyClient,
      sessionResumption: config.sessionResumption,
      ocspStapling: config.ocspStapling,
      securityLevel
    };

    return {
      configuration: JSON.stringify(tlsConfiguration, null, 2),
      securityLevel
    };
  }

  validateCertificate(certificateData: string): CertificateInfo {
    // This would implement actual certificate validation
    // For now, return mock certificate info
    const cert: CertificateInfo = {
      subject: 'CN=ids-connector.example.com',
      issuer: 'CN=Example CA',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      serialNumber: '123456789',
      fingerprint: 'SHA256:1234567890abcdef',
      keyUsage: ['Digital Signature', 'Key Encipherment'],
      extendedKeyUsage: ['Server Authentication'],
      subjectAltNames: ['ids-connector.example.com', 'www.ids-connector.example.com'],
      isValidChain: true,
      isRevoked: false
    };

    this.certificates.set(cert.fingerprint, cert);
    return cert;
  }

  checkCertificateExpiration(): { expiring: CertificateInfo[], expired: CertificateInfo[] } {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiring: CertificateInfo[] = [];
    const expired: CertificateInfo[] = [];

    for (const cert of this.certificates.values()) {
      if (cert.validTo < now) {
        expired.push(cert);
      } else if (cert.validTo < thirtyDaysFromNow) {
        expiring.push(cert);
      }
    }

    return { expiring, expired };
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Trigger immediate response for critical events
    if (event.severity === 'critical') {
      this.handleCriticalEvent(securityEvent);
    }
  }

  private handleCriticalEvent(event: SecurityEvent): void {
    console.warn('CRITICAL SECURITY EVENT:', event);
    // Implementation would trigger alerts, notifications, etc.
  }

  getSecurityEvents(filters?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    timeRange?: { start: Date; end: Date };
    source?: string;
  }): SecurityEvent[] {
    let filtered = this.securityEvents;

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
      }
      if (filters.timeRange) {
        filtered = filtered.filter(e =>
          e.timestamp >= filters.timeRange!.start &&
          e.timestamp <= filters.timeRange!.end
        );
      }
      if (filters.source) {
        filtered = filtered.filter(e => e.source === filters.source);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip);
    this.logSecurityEvent({
      type: 'blocked-request',
      severity: 'high',
      source: ip,
      target: 'server',
      description: `IP manually blocked: ${reason}`,
      metadata: { reason }
    });
  }

  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  private startSecurityMonitoring(): void {
    // Clean up old suspicious activity data every hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      for (const [ip, activity] of this.suspiciousActivity) {
        if (activity.lastSeen < oneHourAgo) {
          this.suspiciousActivity.delete(ip);
        }
      }
    }, 60 * 60 * 1000);

    // Check certificate expiration daily
    setInterval(() => {
      const { expiring, expired } = this.checkCertificateExpiration();

      for (const cert of expired) {
        this.logSecurityEvent({
          type: 'certificate-error',
          severity: 'critical',
          source: 'certificate-monitor',
          target: cert.subject,
          description: 'Certificate has expired',
          metadata: { fingerprint: cert.fingerprint, expiredOn: cert.validTo }
        });
      }

      for (const cert of expiring) {
        this.logSecurityEvent({
          type: 'certificate-error',
          severity: 'medium',
          source: 'certificate-monitor',
          target: cert.subject,
          description: 'Certificate expiring soon',
          metadata: { fingerprint: cert.fingerprint, expiresOn: cert.validTo }
        });
      }
    }, 24 * 60 * 60 * 1000);
  }

  generateSecurityReport(): {
    summary: {
      totalEvents: number;
      criticalEvents: number;
      blockedIPs: number;
      certificateIssues: number;
    };
    recentEvents: SecurityEvent[];
    recommendations: string[];
  } {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvents = this.getSecurityEvents({ timeRange: { start: last24Hours, end: now } });
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical');
    const { expiring, expired } = this.checkCertificateExpiration();

    const recommendations: string[] = [];

    if (criticalEvents.length > 0) {
      recommendations.push('Review and address critical security events immediately');
    }

    if (expired.length > 0) {
      recommendations.push('Renew expired certificates immediately');
    }

    if (expiring.length > 0) {
      recommendations.push('Schedule certificate renewal for expiring certificates');
    }

    if (this.blockedIPs.size > 100) {
      recommendations.push('Review blocked IP list for potential false positives');
    }

    return {
      summary: {
        totalEvents: recentEvents.length,
        criticalEvents: criticalEvents.length,
        blockedIPs: this.blockedIPs.size,
        certificateIssues: expired.length + expiring.length
      },
      recentEvents: recentEvents.slice(0, 10),
      recommendations
    };
  }
}

export { TransportSecurityService };