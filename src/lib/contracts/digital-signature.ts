import { z } from 'zod';

// Digital Signature System for Contract Management
export interface DigitalSignature {
  id: string;
  contractId: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signerOrganization: string;
  signatureValue: string; // Base64 encoded signature
  certificateChain: string[]; // X.509 certificate chain
  algorithm: 'RSA-SHA256' | 'ECDSA-SHA256' | 'Ed25519';
  timestamp: string;
  timestampServer?: string;
  signatureType: 'simple' | 'advanced' | 'qualified';
  reason?: string;
  location?: string;
  contactInfo?: string;
  documentHash: string;
  signatureHash: string;
  validationStatus: 'valid' | 'invalid' | 'unknown' | 'revoked';
  validationTimestamp?: string;
  biometricData?: BiometricData;
}

export interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm';
  template: string; // Encrypted biometric template
  quality: number; // 0-100 quality score
  capturedAt: string;
  device: string;
}

export interface SigningRequest {
  contractId: string;
  documentContent: string;
  requiredSigners: Array<{
    userId: string;
    role: string;
    order: number;
    required: boolean;
  }>;
  signingDeadline?: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
}

export interface SigningSession {
  id: string;
  contractId: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    browser: string;
    os: string;
    trusted: boolean;
  };
  authenticationMethods: Array<{
    type: 'password' | 'mfa' | 'certificate' | 'biometric';
    status: 'pending' | 'verified' | 'failed';
    timestamp?: string;
  }>;
  documentViewed: boolean;
  documentViewTime?: number; // seconds
  consentGiven: boolean;
  consentTimestamp?: string;
}

export interface ContractVersion {
  id: string;
  contractId: string;
  version: string;
  content: string;
  contentHash: string;
  changesFromPrevious: string[];
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'review' | 'approved' | 'executed' | 'terminated';
  signatures: DigitalSignature[];
  metadata: {
    title: string;
    parties: string[];
    contractType: string;
    jurisdiction: string;
    effectiveDate?: string;
    expirationDate?: string;
    renewalTerms?: string;
  };
}

export interface CertificateAuthority {
  id: string;
  name: string;
  rootCertificate: string;
  intermediateCertificates: string[];
  crlUrl: string; // Certificate Revocation List URL
  ocspUrl: string; // Online Certificate Status Protocol URL
  trustLevel: 'high' | 'medium' | 'low';
  validFrom: string;
  validTo: string;
}

export class DigitalSignatureService {

  /**
   * Create a signing request for a contract
   */
  static createSigningRequest(
    contractId: string,
    documentContent: string,
    requiredSigners: SigningRequest['requiredSigners'],
    requestedBy: string,
    options?: {
      deadline?: string;
      reason?: string;
    }
  ): SigningRequest {
    return {
      contractId,
      documentContent,
      requiredSigners: requiredSigners.sort((a, b) => a.order - b.order),
      signingDeadline: options?.deadline,
      reason: options?.reason || 'Contract execution',
      requestedBy,
      requestedAt: new Date().toISOString(),
    };
  }

  /**
   * Start a signing session for a user
   */
  static startSigningSession(
    contractId: string,
    userId: string,
    deviceInfo: SigningSession['deviceInfo']
  ): SigningSession {
    return {
      id: this.generateSessionId(),
      contractId,
      userId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      deviceInfo,
      authenticationMethods: [
        { type: 'password', status: 'pending' },
        { type: 'mfa', status: 'pending' },
      ],
      documentViewed: false,
      consentGiven: false,
    };
  }

  /**
   * Generate digital signature for a document
   */
  static async generateSignature(
    contractId: string,
    documentContent: string,
    signerInfo: {
      userId: string;
      name: string;
      role: string;
      organization: string;
      certificate: string;
      privateKey: string;
    },
    options?: {
      reason?: string;
      location?: string;
      contactInfo?: string;
      biometricData?: BiometricData;
    }
  ): Promise<DigitalSignature> {
    // Calculate document hash
    const documentHash = await this.calculateDocumentHash(documentContent);

    // Create signature payload
    const signaturePayload = {
      contractId,
      documentHash,
      signerId: signerInfo.userId,
      timestamp: new Date().toISOString(),
      reason: options?.reason,
      location: options?.location,
    };

    // Generate signature (simplified - in production, use proper cryptographic library)
    const signatureValue = await this.createDigitalSignature(
      JSON.stringify(signaturePayload),
      signerInfo.privateKey
    );

    const signatureHash = await this.calculateSignatureHash(signatureValue);

    return {
      id: this.generateSignatureId(),
      contractId,
      signerId: signerInfo.userId,
      signerName: signerInfo.name,
      signerRole: signerInfo.role,
      signerOrganization: signerInfo.organization,
      signatureValue,
      certificateChain: [signerInfo.certificate],
      algorithm: 'RSA-SHA256',
      timestamp: new Date().toISOString(),
      signatureType: 'advanced',
      reason: options?.reason,
      location: options?.location,
      contactInfo: options?.contactInfo,
      documentHash,
      signatureHash,
      validationStatus: 'valid',
      biometricData: options?.biometricData,
    };
  }

  /**
   * Verify a digital signature
   */
  static async verifySignature(
    signature: DigitalSignature,
    documentContent: string,
    trustedCAs: CertificateAuthority[]
  ): Promise<{
    isValid: boolean;
    status: 'valid' | 'invalid' | 'revoked' | 'expired' | 'untrusted';
    details: {
      signatureValid: boolean;
      certificateValid: boolean;
      certificateChainValid: boolean;
      notRevoked: boolean;
      timestampValid: boolean;
    };
    errors: string[];
  }> {
    const errors: string[] = [];

    // Verify document hash
    const calculatedHash = await this.calculateDocumentHash(documentContent);
    const documentHashValid = calculatedHash === signature.documentHash;

    if (!documentHashValid) {
      errors.push('Document hash mismatch - document may have been modified');
    }

    // Verify signature
    const signatureValid = await this.verifyDigitalSignature(
      signature.signatureValue,
      signature.documentHash,
      signature.certificateChain[0]
    );

    if (!signatureValid) {
      errors.push('Digital signature verification failed');
    }

    // Verify certificate chain
    const certificateChainValid = await this.verifyCertificateChain(
      signature.certificateChain,
      trustedCAs
    );

    if (!certificateChainValid) {
      errors.push('Certificate chain validation failed');
    }

    // Check certificate revocation
    const notRevoked = await this.checkCertificateRevocation(signature.certificateChain[0]);

    if (!notRevoked) {
      errors.push('Certificate has been revoked');
    }

    // Verify timestamp
    const timestampValid = this.verifyTimestamp(signature.timestamp);

    if (!timestampValid) {
      errors.push('Signature timestamp is invalid');
    }

    const isValid = documentHashValid && signatureValid && certificateChainValid && notRevoked && timestampValid;

    let status: 'valid' | 'invalid' | 'revoked' | 'expired' | 'untrusted' = 'valid';

    if (!isValid) {
      if (!notRevoked) {
        status = 'revoked';
      } else if (!certificateChainValid) {
        status = 'untrusted';
      } else {
        status = 'invalid';
      }
    }

    return {
      isValid,
      status,
      details: {
        signatureValid,
        certificateValid: true, // Simplified
        certificateChainValid,
        notRevoked,
        timestampValid,
      },
      errors,
    };
  }

  /**
   * Create a contract version with signatures
   */
  static createContractVersion(
    contractId: string,
    content: string,
    metadata: ContractVersion['metadata'],
    createdBy: string,
    previousVersion?: ContractVersion
  ): ContractVersion {
    const contentHash = this.calculateDocumentHashSync(content);

    let changesFromPrevious: string[] = [];
    if (previousVersion) {
      changesFromPrevious = this.calculateChanges(previousVersion.content, content);
    }

    return {
      id: this.generateVersionId(),
      contractId,
      version: this.generateVersionNumber(previousVersion?.version),
      content,
      contentHash,
      changesFromPrevious,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'draft',
      signatures: [],
      metadata,
    };
  }

  /**
   * Add signature to contract version
   */
  static addSignatureToContract(
    contractVersion: ContractVersion,
    signature: DigitalSignature
  ): ContractVersion {
    // Verify signature is for this contract
    if (signature.contractId !== contractVersion.contractId) {
      throw new Error('Signature contract ID does not match');
    }

    // Verify document hash matches
    if (signature.documentHash !== contractVersion.contentHash) {
      throw new Error('Signature document hash does not match contract content');
    }

    // Check if signer already signed
    const existingSignature = contractVersion.signatures.find(
      sig => sig.signerId === signature.signerId
    );

    if (existingSignature) {
      throw new Error('Signer has already signed this contract');
    }

    // Add signature
    contractVersion.signatures.push(signature);

    // Update contract status if all required signatures are collected
    const requiredSignatures = this.getRequiredSignatures(contractVersion.contractId);
    const collectedSignatures = contractVersion.signatures.length;

    if (collectedSignatures >= requiredSignatures) {
      contractVersion.status = 'executed';
    }

    return contractVersion;
  }

  /**
   * Generate signature verification report
   */
  static generateVerificationReport(
    contractVersion: ContractVersion,
    trustedCAs: CertificateAuthority[]
  ): {
    contractId: string;
    version: string;
    totalSignatures: number;
    validSignatures: number;
    invalidSignatures: number;
    revokedSignatures: number;
    overallStatus: 'fully_valid' | 'partially_valid' | 'invalid';
    signatureDetails: Array<{
      signature: DigitalSignature;
      verificationResult: Awaited<ReturnType<typeof this.verifySignature>>;
    }>;
    reportGeneratedAt: string;
  } {
    // In real implementation, this would be async and verify all signatures
    const mockVerificationResults = contractVersion.signatures.map(signature => ({
      signature,
      verificationResult: {
        isValid: signature.validationStatus === 'valid',
        status: signature.validationStatus as any,
        details: {
          signatureValid: true,
          certificateValid: true,
          certificateChainValid: true,
          notRevoked: true,
          timestampValid: true,
        },
        errors: [],
      },
    }));

    const validSignatures = mockVerificationResults.filter(r => r.verificationResult.isValid).length;
    const invalidSignatures = mockVerificationResults.filter(r => !r.verificationResult.isValid).length;
    const revokedSignatures = mockVerificationResults.filter(
      r => r.verificationResult.status === 'revoked'
    ).length;

    let overallStatus: 'fully_valid' | 'partially_valid' | 'invalid' = 'invalid';
    if (validSignatures === contractVersion.signatures.length && contractVersion.signatures.length > 0) {
      overallStatus = 'fully_valid';
    } else if (validSignatures > 0) {
      overallStatus = 'partially_valid';
    }

    return {
      contractId: contractVersion.contractId,
      version: contractVersion.version,
      totalSignatures: contractVersion.signatures.length,
      validSignatures,
      invalidSignatures,
      revokedSignatures,
      overallStatus,
      signatureDetails: mockVerificationResults,
      reportGeneratedAt: new Date().toISOString(),
    };
  }

  // Private helper methods
  private static async calculateDocumentHash(content: string): Promise<string> {
    // Simplified hash calculation - in production, use proper crypto library
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static calculateDocumentHashSync(content: string): string {
    // Simple synchronous hash for demo
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private static async calculateSignatureHash(signature: string): Promise<string> {
    return this.calculateDocumentHash(signature);
  }

  private static async createDigitalSignature(data: string, privateKey: string): Promise<string> {
    // Simplified signature generation - in production, use proper crypto library
    return Buffer.from(`signature_of_${data}_with_${privateKey.substring(0, 10)}`).toString('base64');
  }

  private static async verifyDigitalSignature(
    signature: string,
    data: string,
    certificate: string
  ): Promise<boolean> {
    // Simplified verification - in production, use proper crypto library
    try {
      const decoded = Buffer.from(signature, 'base64').toString();
      return decoded.includes(data) && decoded.includes('signature_of_');
    } catch {
      return false;
    }
  }

  private static async verifyCertificateChain(
    certificateChain: string[],
    trustedCAs: CertificateAuthority[]
  ): Promise<boolean> {
    // Simplified chain verification - in production, use proper X.509 validation
    return certificateChain.length > 0 && trustedCAs.length > 0;
  }

  private static async checkCertificateRevocation(certificate: string): Promise<boolean> {
    // Simplified revocation check - in production, check CRL or OCSP
    return !certificate.includes('revoked');
  }

  private static verifyTimestamp(timestamp: string): boolean {
    const signatureTime = new Date(timestamp);
    const now = new Date();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    return signatureTime <= now && (now.getTime() - signatureTime.getTime()) <= maxAge;
  }

  private static calculateChanges(oldContent: string, newContent: string): string[] {
    // Simplified diff calculation
    const changes: string[] = [];

    if (oldContent.length !== newContent.length) {
      changes.push(`Content length changed from ${oldContent.length} to ${newContent.length} characters`);
    }

    // Add more sophisticated diff logic here

    return changes;
  }

  private static generateVersionNumber(previousVersion?: string): string {
    if (!previousVersion) return '1.0.0';

    const [major, minor, patch] = previousVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private static getRequiredSignatures(contractId: string): number {
    // In real implementation, get from contract metadata
    return 2; // Default minimum signatures
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateSignatureId(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateVersionId(): string {
    return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Certificate validation schemas
export const X509CertificateSchema = z.object({
  subject: z.string(),
  issuer: z.string(),
  serialNumber: z.string(),
  notBefore: z.string().datetime(),
  notAfter: z.string().datetime(),
  publicKey: z.string(),
  signature: z.string(),
  extensions: z.record(z.any()).optional(),
});

// Signature validation schemas
export const SignatureValidationSchema = z.object({
  signatureValue: z.string(),
  algorithm: z.enum(['RSA-SHA256', 'ECDSA-SHA256', 'Ed25519']),
  certificate: X509CertificateSchema,
  timestamp: z.string().datetime(),
  documentHash: z.string(),
});

export type X509Certificate = z.infer<typeof X509CertificateSchema>;
export type SignatureValidation = z.infer<typeof SignatureValidationSchema>;

export default DigitalSignatureService;