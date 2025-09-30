import { z } from 'zod';

// Versioning System for Metadata Management
export interface MetadataVersion {
  id: string;
  metadataId: string;
  version: string; // Semantic versioning (e.g., 1.0.0)
  data: Record<string, any>;
  changeType: 'major' | 'minor' | 'patch';
  changeDescription: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  parentVersion?: string;
  checksum: string; // Data integrity verification
  tags: string[];
}

export interface MetadataLineage {
  metadataId: string;
  sourceDatasets: Array<{
    id: string;
    name: string;
    type: string;
    version: string;
  }>;
  derivedDatasets: Array<{
    id: string;
    name: string;
    type: string;
    version: string;
  }>;
  transformations: Array<{
    id: string;
    type: string;
    description: string;
    appliedAt: string;
    appliedBy: string;
  }>;
  qualityMetrics: {
    completeness: number; // 0-100%
    accuracy: number;     // 0-100%
    consistency: number;  // 0-100%
    timeliness: number;   // 0-100%
  };
}

export class MetadataVersioningService {

  /**
   * Create a new version of metadata
   */
  static createVersion(
    metadataId: string,
    data: Record<string, any>,
    changeType: 'major' | 'minor' | 'patch',
    changeDescription: string,
    userId: string,
    parentVersion?: string
  ): MetadataVersion {
    const currentVersion = this.getCurrentVersion(metadataId);
    const newVersion = this.incrementVersion(currentVersion?.version || '0.0.0', changeType);

    return {
      id: this.generateVersionId(),
      metadataId,
      version: newVersion,
      data,
      changeType,
      changeDescription,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'draft',
      parentVersion: parentVersion || currentVersion?.version,
      checksum: this.calculateChecksum(data),
      tags: this.extractTags(data),
    };
  }

  /**
   * Get version history for metadata
   */
  static getVersionHistory(metadataId: string): MetadataVersion[] {
    // In real implementation, this would fetch from database
    return this.mockVersionHistory(metadataId);
  }

  /**
   * Compare two versions and return diff
   */
  static compareVersions(
    version1: MetadataVersion,
    version2: MetadataVersion
  ): MetadataVersionDiff {
    return {
      added: this.getAddedFields(version1.data, version2.data),
      modified: this.getModifiedFields(version1.data, version2.data),
      removed: this.getRemovedFields(version1.data, version2.data),
      summary: this.generateDiffSummary(version1, version2),
    };
  }

  /**
   * Restore metadata to specific version
   */
  static restoreVersion(
    metadataId: string,
    targetVersion: string,
    userId: string
  ): MetadataVersion {
    const targetVersionData = this.getVersionData(metadataId, targetVersion);

    return this.createVersion(
      metadataId,
      targetVersionData,
      'major',
      `Restored to version ${targetVersion}`,
      userId
    );
  }

  /**
   * Build lineage graph for metadata
   */
  static buildLineage(metadataId: string): MetadataLineage {
    // In real implementation, this would trace through transformation history
    return {
      metadataId,
      sourceDatasets: this.getSourceDatasets(metadataId),
      derivedDatasets: this.getDerivedDatasets(metadataId),
      transformations: this.getTransformationHistory(metadataId),
      qualityMetrics: this.calculateQualityMetrics(metadataId),
    };
  }

  /**
   * Validate version integrity
   */
  static validateVersionIntegrity(version: MetadataVersion): ValidationResult {
    const calculatedChecksum = this.calculateChecksum(version.data);
    const isValid = calculatedChecksum === version.checksum;

    return {
      isValid,
      errors: isValid ? [] : ['Checksum mismatch - data may be corrupted'],
      warnings: this.getVersionWarnings(version),
    };
  }

  // Private helper methods
  private static getCurrentVersion(metadataId: string): MetadataVersion | null {
    const history = this.getVersionHistory(metadataId);
    return history.find(v => v.status === 'approved') || null;
  }

  private static incrementVersion(
    currentVersion: string,
    changeType: 'major' | 'minor' | 'patch'
  ): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (changeType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return currentVersion;
    }
  }

  private static generateVersionId(): string {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateChecksum(data: Record<string, any>): string {
    // Simple checksum - in production, use proper hashing
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private static extractTags(data: Record<string, any>): string[] {
    const tags: string[] = [];

    // Auto-generate tags based on content
    if (data.operator) tags.push(`operator:${data.operator}`);
    if (data.type) tags.push(`type:${data.type}`);
    if (data.status) tags.push(`status:${data.status}`);
    if (data.workingArea) tags.push(`working-area:${data.workingArea}`);

    return tags;
  }

  private static getAddedFields(oldData: any, newData: any): string[] {
    const oldKeys = new Set(Object.keys(oldData));
    return Object.keys(newData).filter(key => !oldKeys.has(key));
  }

  private static getModifiedFields(oldData: any, newData: any): Array<{field: string, oldValue: any, newValue: any}> {
    const modified: Array<{field: string, oldValue: any, newValue: any}> = [];

    for (const key of Object.keys(oldData)) {
      if (newData.hasOwnProperty(key) && JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        modified.push({
          field: key,
          oldValue: oldData[key],
          newValue: newData[key],
        });
      }
    }

    return modified;
  }

  private static getRemovedFields(oldData: any, newData: any): string[] {
    const newKeys = new Set(Object.keys(newData));
    return Object.keys(oldData).filter(key => !newKeys.has(key));
  }

  private static generateDiffSummary(version1: MetadataVersion, version2: MetadataVersion): string {
    return `Version ${version1.version} → ${version2.version}: ${version2.changeDescription}`;
  }

  private static getVersionData(metadataId: string, version: string): Record<string, any> {
    const history = this.getVersionHistory(metadataId);
    const versionRecord = history.find(v => v.version === version);
    return versionRecord?.data || {};
  }

  private static getSourceDatasets(metadataId: string): Array<{id: string, name: string, type: string, version: string}> {
    // Mock implementation - in real app, trace lineage
    return [
      { id: 'src1', name: 'Raw Survey Data', type: 'seismic', version: '1.0.0' },
      { id: 'src2', name: 'Well Logs', type: 'well', version: '2.1.0' },
    ];
  }

  private static getDerivedDatasets(metadataId: string): Array<{id: string, name: string, type: string, version: string}> {
    return [
      { id: 'der1', name: 'Processed Seismic', type: 'seismic', version: '1.1.0' },
    ];
  }

  private static getTransformationHistory(metadataId: string): Array<{id: string, type: string, description: string, appliedAt: string, appliedBy: string}> {
    return [
      {
        id: 'trans1',
        type: 'migration',
        description: 'Migrated depth to time domain',
        appliedAt: new Date().toISOString(),
        appliedBy: 'processing-engine',
      },
    ];
  }

  private static calculateQualityMetrics(metadataId: string): {completeness: number, accuracy: number, consistency: number, timeliness: number} {
    return {
      completeness: 95,
      accuracy: 98,
      consistency: 92,
      timeliness: 88,
    };
  }

  private static getVersionWarnings(version: MetadataVersion): string[] {
    const warnings: string[] = [];

    if (version.status === 'draft' && this.daysSince(version.createdAt) > 30) {
      warnings.push('Version has been in draft status for over 30 days');
    }

    if (!version.approvedBy && version.status === 'approved') {
      warnings.push('Version is approved but missing approver information');
    }

    return warnings;
  }

  private static daysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static mockVersionHistory(metadataId: string): MetadataVersion[] {
    return [
      {
        id: 'v1',
        metadataId,
        version: '1.0.0',
        data: { name: 'Initial Version', status: 'draft' },
        changeType: 'major',
        changeDescription: 'Initial creation',
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'approved',
        checksum: 'abc123',
        tags: ['initial'],
      },
      {
        id: 'v2',
        metadataId,
        version: '1.1.0',
        data: { name: 'Updated Version', status: 'active' },
        changeType: 'minor',
        changeDescription: 'Updated status and name',
        createdBy: 'user2',
        createdAt: '2024-06-01T00:00:00Z',
        status: 'approved',
        parentVersion: '1.0.0',
        checksum: 'def456',
        tags: ['update'],
      },
    ];
  }
}

// Type definitions
export interface MetadataVersionDiff {
  added: string[];
  modified: Array<{field: string, oldValue: any, newValue: any}>;
  removed: string[];
  summary: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export the service
export default MetadataVersioningService;