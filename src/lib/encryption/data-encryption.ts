import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  keySize: number;
  ivSize: number;
  tagSize?: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag?: string;
  algorithm: string;
  keyId: string;
  metadata?: Record<string, any>;
}

export interface KeyRotationPolicy {
  rotationInterval: number; // days
  maxKeyAge: number; // days
  automaticRotation: boolean;
  notificationThreshold: number; // days before expiration
}

export interface EncryptionKey {
  id: string;
  key: Buffer;
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'revoked';
  usage: 'encryption' | 'signing' | 'key-exchange';
  metadata?: Record<string, any>;
}

class DataEncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private config: EncryptionConfig = {
    algorithm: 'AES-256-GCM',
    keySize: 32,
    ivSize: 16,
    tagSize: 16
  };
  private rotationPolicy: KeyRotationPolicy = {
    rotationInterval: 90,
    maxKeyAge: 365,
    automaticRotation: true,
    notificationThreshold: 7
  };

  constructor(config?: Partial<EncryptionConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeDefaultKeys();
  }

  private initializeDefaultKeys(): void {
    const defaultKey = this.generateKey('default', 'encryption');
    this.keys.set(defaultKey.id, defaultKey);
  }

  generateKey(keyId: string, usage: 'encryption' | 'signing' | 'key-exchange'): EncryptionKey {
    const key = crypto.randomBytes(this.config.keySize);
    const encryptionKey: EncryptionKey = {
      id: keyId,
      key,
      algorithm: this.config.algorithm,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.rotationPolicy.maxKeyAge * 24 * 60 * 60 * 1000),
      status: 'active',
      usage,
      metadata: {
        source: 'generated',
        keySize: this.config.keySize
      }
    };

    this.keys.set(keyId, encryptionKey);
    return encryptionKey;
  }

  async encryptData(data: string | Buffer, keyId: string = 'default', metadata?: Record<string, any>): Promise<EncryptedData> {
    const key = this.keys.get(keyId);
    if (!key || key.status !== 'active') {
      throw new Error(`Encryption key ${keyId} not found or inactive`);
    }

    const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    const iv = crypto.randomBytes(this.config.ivSize);

    let encrypted: Buffer;
    let tag: Buffer | undefined;

    if (this.config.algorithm === 'AES-256-GCM') {
      const cipher = crypto.createCipher(this.config.algorithm, key.key);
      cipher.setAAD(Buffer.from(keyId));

      const chunks = [cipher.update(dataBuffer)];
      chunks.push(cipher.final());
      encrypted = Buffer.concat(chunks);
      tag = cipher.getAuthTag();
    } else {
      const cipher = crypto.createCipher(this.config.algorithm, key.key);
      const chunks = [cipher.update(dataBuffer)];
      chunks.push(cipher.final());
      encrypted = Buffer.concat(chunks);
    }

    return {
      data: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag?.toString('base64'),
      algorithm: this.config.algorithm,
      keyId,
      metadata
    };
  }

  async decryptData(encryptedData: EncryptedData): Promise<Buffer> {
    const key = this.keys.get(encryptedData.keyId);
    if (!key) {
      throw new Error(`Decryption key ${encryptedData.keyId} not found`);
    }

    const data = Buffer.from(encryptedData.data, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');

    let decrypted: Buffer;

    if (encryptedData.algorithm === 'AES-256-GCM') {
      if (!encryptedData.tag) {
        throw new Error('Authentication tag required for GCM mode');
      }

      const decipher = crypto.createDecipher(encryptedData.algorithm, key.key);
      decipher.setAAD(Buffer.from(encryptedData.keyId));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));

      const chunks = [decipher.update(data)];
      chunks.push(decipher.final());
      decrypted = Buffer.concat(chunks);
    } else {
      const decipher = crypto.createDecipher(encryptedData.algorithm, key.key);
      const chunks = [decipher.update(data)];
      chunks.push(decipher.final());
      decrypted = Buffer.concat(chunks);
    }

    return decrypted;
  }

  async rotateKey(keyId: string, preserveOld: boolean = true): Promise<EncryptionKey> {
    const oldKey = this.keys.get(keyId);
    if (!oldKey) {
      throw new Error(`Key ${keyId} not found`);
    }

    if (preserveOld) {
      oldKey.status = 'expired';
      this.keys.set(`${keyId}_old_${Date.now()}`, oldKey);
    }

    const newKey = this.generateKey(keyId, oldKey.usage);
    return newKey;
  }

  async encryptFile(filePath: string, outputPath: string, keyId: string = 'default'): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const data = await fs.readFile(filePath);
    const encrypted = await this.encryptData(data, keyId, { originalPath: filePath });

    const encryptedFile = {
      ...encrypted,
      originalName: filePath.split('/').pop(),
      encryptedAt: new Date().toISOString()
    };

    await fs.writeFile(outputPath, JSON.stringify(encryptedFile, null, 2));
  }

  async decryptFile(encryptedFilePath: string, outputPath: string): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');
    const encryptedData = JSON.parse(encryptedContent);
    const decrypted = await this.decryptData(encryptedData);

    await fs.writeFile(outputPath, decrypted);
  }

  getKeyInfo(keyId: string): EncryptionKey | undefined {
    return this.keys.get(keyId);
  }

  listKeys(): EncryptionKey[] {
    return Array.from(this.keys.values());
  }

  checkKeyExpiration(): { expiring: EncryptionKey[], expired: EncryptionKey[] } {
    const now = new Date();
    const notificationDate = new Date(now.getTime() + this.rotationPolicy.notificationThreshold * 24 * 60 * 60 * 1000);

    const expiring: EncryptionKey[] = [];
    const expired: EncryptionKey[] = [];

    for (const key of this.keys.values()) {
      if (key.expiresAt) {
        if (key.expiresAt < now) {
          expired.push(key);
        } else if (key.expiresAt < notificationDate) {
          expiring.push(key);
        }
      }
    }

    return { expiring, expired };
  }

  async performKeyRotation(): Promise<void> {
    if (!this.rotationPolicy.automaticRotation) return;

    const { expired, expiring } = this.checkKeyExpiration();

    for (const key of expired) {
      key.status = 'expired';
    }

    for (const key of expiring) {
      if (key.status === 'active') {
        await this.rotateKey(key.id);
      }
    }
  }
}

export interface DatabaseEncryptionConfig {
  encryptionAtRest: boolean;
  fieldLevelEncryption: string[]; // field names to encrypt
  keyDerivationRounds: number;
  compressionEnabled: boolean;
}

class DatabaseEncryption {
  private encryptionService: DataEncryptionService;
  private config: DatabaseEncryptionConfig;

  constructor(encryptionService: DataEncryptionService, config: DatabaseEncryptionConfig) {
    this.encryptionService = encryptionService;
    this.config = config;
  }

  async encryptRecord(record: Record<string, any>, keyId?: string): Promise<Record<string, any>> {
    if (!this.config.encryptionAtRest) return record;

    const encryptedRecord = { ...record };

    for (const field of this.config.fieldLevelEncryption) {
      if (record[field] !== undefined) {
        const encrypted = await this.encryptionService.encryptData(
          JSON.stringify(record[field]),
          keyId,
          { field, recordType: 'database' }
        );
        encryptedRecord[field] = encrypted;
        encryptedRecord[`${field}_encrypted`] = true;
      }
    }

    return encryptedRecord;
  }

  async decryptRecord(record: Record<string, any>): Promise<Record<string, any>> {
    if (!this.config.encryptionAtRest) return record;

    const decryptedRecord = { ...record };

    for (const field of this.config.fieldLevelEncryption) {
      if (record[`${field}_encrypted`] && record[field]) {
        const decrypted = await this.encryptionService.decryptData(record[field]);
        decryptedRecord[field] = JSON.parse(decrypted.toString('utf8'));
        delete decryptedRecord[`${field}_encrypted`];
      }
    }

    return decryptedRecord;
  }
}

export { DataEncryptionService, DatabaseEncryption };