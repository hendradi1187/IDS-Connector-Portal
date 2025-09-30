import { z } from 'zod';

// Ontology Management System for Vocabularies
export interface OntologyTerm {
  id: string;
  uri: string; // Unique URI for the term
  label: string;
  definition: string;
  description?: string;
  synonyms: string[];
  preferredLabel?: string;
  alternativeLabels: string[];
  examples: string[];
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'enum';
  allowedValues?: string[]; // For enum types
  validationPattern?: string; // Regex pattern for validation
  unit?: string; // For numeric values
  namespace: string;
  category: string;
  subCategory?: string;
  status: 'draft' | 'published' | 'deprecated' | 'retired';
  version: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  modifiedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface OntologyRelationship {
  id: string;
  sourceTermId: string;
  targetTermId: string;
  relationshipType: 'subClassOf' | 'superClassOf' | 'relatedTo' | 'partOf' | 'hasProperty' | 'equivalentTo' | 'differentFrom' | 'inverseOf';
  strength: 'strong' | 'medium' | 'weak'; // Relationship strength
  confidence: number; // 0-1 confidence score
  bidirectional: boolean;
  context?: string;
  evidence?: string[];
  createdBy: string;
  createdAt: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface OntologyVocabulary {
  id: string;
  name: string;
  description: string;
  purpose: string;
  domain: string; // e.g., "oil-and-gas", "geology", "engineering"
  scope: 'internal' | 'industry' | 'global';
  baseUri: string;
  version: string;
  language: string;
  license: string;
  terms: OntologyTerm[];
  relationships: OntologyRelationship[];
  imports: string[]; // URIs of imported vocabularies
  exports: string[]; // URIs that this vocabulary exports
  mappings: VocabularyMapping[];
  compliance: {
    standards: string[]; // e.g., "SKOS", "OWL", "Dublin Core"
    certifications: string[];
    lastAudit?: string;
  };
  usage: {
    linkedDatasets: string[];
    applications: string[];
    downloadCount: number;
    lastAccessed?: string;
  };
  governance: {
    owner: string;
    maintainers: string[];
    reviewers: string[];
    updateFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    nextReview?: string;
  };
  metadata: {
    keywords: string[];
    topics: string[];
    geographicCoverage?: string[];
    temporalCoverage?: {
      start?: string;
      end?: string;
    };
  };
  status: 'development' | 'published' | 'deprecated' | 'archived';
  createdAt: string;
  lastModified: string;
}

export interface VocabularyMapping {
  id: string;
  sourceVocabularyId: string;
  targetVocabularyId: string;
  mappingType: 'exact' | 'close' | 'related' | 'broader' | 'narrower';
  mappings: Array<{
    sourceTermId: string;
    targetTermId: string;
    mappingRelation: 'exactMatch' | 'closeMatch' | 'relatedMatch' | 'broadMatch' | 'narrowMatch';
    confidence: number;
    evidence?: string;
    validatedBy?: string;
    validatedAt?: string;
  }>;
  createdBy: string;
  createdAt: string;
  lastValidated?: string;
}

export interface ConceptGraph {
  nodes: Array<{
    id: string;
    uri: string;
    label: string;
    type: 'concept' | 'property' | 'class' | 'individual';
    vocabulary: string;
    x?: number; // Layout coordinates
    y?: number;
    cluster?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    weight: number;
    label?: string;
  }>;
  clusters: Array<{
    id: string;
    name: string;
    color: string;
    nodeIds: string[];
  }>;
}

export interface SemanticQuery {
  query: string;
  type: 'sparql' | 'keyword' | 'conceptual';
  filters?: {
    vocabularies?: string[];
    domains?: string[];
    status?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  options?: {
    includeRelated?: boolean;
    maxResults?: number;
    minConfidence?: number;
    language?: string;
  };
}

export interface SemanticSearchResult {
  term: OntologyTerm;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'semantic' | 'phonetic';
  matchedFields: string[];
  relatedTerms: Array<{
    term: OntologyTerm;
    relationship: string;
    strength: number;
  }>;
  vocabulary: {
    id: string;
    name: string;
    domain: string;
  };
}

export class OntologyManagementService {

  /**
   * Create a new vocabulary
   */
  static createVocabulary(
    name: string,
    description: string,
    domain: string,
    creatorId: string,
    options?: {
      baseUri?: string;
      language?: string;
      license?: string;
      scope?: 'internal' | 'industry' | 'global';
    }
  ): OntologyVocabulary {
    const vocabularyId = this.generateVocabularyId();
    const baseUri = options?.baseUri || `https://vocabulary.ids-portal.com/${vocabularyId}/`;

    return {
      id: vocabularyId,
      name,
      description,
      purpose: 'Standardize terminology and concepts',
      domain,
      scope: options?.scope || 'internal',
      baseUri,
      version: '1.0.0',
      language: options?.language || 'en',
      license: options?.license || 'CC BY 4.0',
      terms: [],
      relationships: [],
      imports: [],
      exports: [],
      mappings: [],
      compliance: {
        standards: ['SKOS', 'Dublin Core'],
        certifications: [],
      },
      usage: {
        linkedDatasets: [],
        applications: [],
        downloadCount: 0,
      },
      governance: {
        owner: creatorId,
        maintainers: [creatorId],
        reviewers: [],
        updateFrequency: 'monthly',
      },
      metadata: {
        keywords: [],
        topics: [],
      },
      status: 'development',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  }

  /**
   * Add a term to vocabulary
   */
  static addTerm(
    vocabularyId: string,
    termData: Omit<OntologyTerm, 'id' | 'uri' | 'createdAt' | 'lastModified'>,
    creatorId: string
  ): OntologyTerm {
    const vocabulary = this.getVocabulary(vocabularyId);

    if (!this.canUserEditVocabulary(vocabulary, creatorId)) {
      throw new Error('User is not authorized to edit this vocabulary');
    }

    const termId = this.generateTermId();
    const uri = `${vocabulary.baseUri}${termId}`;

    const term: OntologyTerm = {
      ...termData,
      id: termId,
      uri,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    // Validate term
    this.validateTerm(term, vocabulary);

    vocabulary.terms.push(term);
    vocabulary.lastModified = new Date().toISOString();

    return term;
  }

  /**
   * Create relationship between terms
   */
  static createRelationship(
    sourceTermId: string,
    targetTermId: string,
    relationshipType: OntologyRelationship['relationshipType'],
    creatorId: string,
    options?: {
      strength?: 'strong' | 'medium' | 'weak';
      confidence?: number;
      context?: string;
      evidence?: string[];
    }
  ): OntologyRelationship {
    const sourceTerm = this.getTerm(sourceTermId);
    const targetTerm = this.getTerm(targetTermId);

    if (!sourceTerm || !targetTerm) {
      throw new Error('Source or target term not found');
    }

    const relationship: OntologyRelationship = {
      id: this.generateRelationshipId(),
      sourceTermId,
      targetTermId,
      relationshipType,
      strength: options?.strength || 'medium',
      confidence: options?.confidence || 0.8,
      bidirectional: this.isBidirectionalRelation(relationshipType),
      context: options?.context,
      evidence: options?.evidence,
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
    };

    // Add relationship to vocabulary
    const vocabulary = this.getVocabularyByTermId(sourceTermId);
    vocabulary.relationships.push(relationship);
    vocabulary.lastModified = new Date().toISOString();

    return relationship;
  }

  /**
   * Search terms using semantic search
   */
  static searchTerms(query: SemanticQuery): SemanticSearchResult[] {
    const vocabularies = this.getAllVocabularies();
    const results: SemanticSearchResult[] = [];

    for (const vocabulary of vocabularies) {
      // Filter vocabularies based on query filters
      if (query.filters?.vocabularies && !query.filters.vocabularies.includes(vocabulary.id)) {
        continue;
      }

      if (query.filters?.domains && !query.filters.domains.includes(vocabulary.domain)) {
        continue;
      }

      // Search terms within vocabulary
      for (const term of vocabulary.terms) {
        const relevance = this.calculateRelevance(term, query.query, query.type);

        if (relevance > 0) {
          const relatedTerms = this.findRelatedTerms(term, vocabulary, 3);

          results.push({
            term,
            relevanceScore: relevance,
            matchType: this.determineMatchType(term, query.query),
            matchedFields: this.getMatchedFields(term, query.query),
            relatedTerms,
            vocabulary: {
              id: vocabulary.id,
              name: vocabulary.name,
              domain: vocabulary.domain,
            },
          });
        }
      }
    }

    // Sort by relevance and apply limits
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const maxResults = query.options?.maxResults || 50;
    return results.slice(0, maxResults);
  }

  /**
   * Build concept graph for visualization
   */
  static buildConceptGraph(
    vocabularyIds: string[],
    options?: {
      includeRelationships?: boolean;
      maxNodes?: number;
      clusterByDomain?: boolean;
    }
  ): ConceptGraph {
    const vocabularies = vocabularyIds.map(id => this.getVocabulary(id));
    const nodes: ConceptGraph['nodes'] = [];
    const edges: ConceptGraph['edges'] = [];
    const clusters: ConceptGraph['clusters'] = [];

    // Add term nodes
    for (const vocabulary of vocabularies) {
      const clusterColor = this.getClusterColor(vocabulary.domain);

      for (const term of vocabulary.terms) {
        nodes.push({
          id: term.id,
          uri: term.uri,
          label: term.label,
          type: 'concept',
          vocabulary: vocabulary.name,
          cluster: vocabulary.domain,
        });
      }

      // Add domain cluster
      if (options?.clusterByDomain && !clusters.find(c => c.id === vocabulary.domain)) {
        clusters.push({
          id: vocabulary.domain,
          name: vocabulary.domain,
          color: clusterColor,
          nodeIds: vocabulary.terms.map(t => t.id),
        });
      }

      // Add relationship edges
      if (options?.includeRelationships) {
        for (const relationship of vocabulary.relationships) {
          edges.push({
            id: relationship.id,
            source: relationship.sourceTermId,
            target: relationship.targetTermId,
            type: relationship.relationshipType,
            weight: relationship.confidence,
            label: relationship.relationshipType,
          });
        }
      }
    }

    // Apply layout algorithm (simplified)
    this.applyForceDirectedLayout(nodes, edges);

    return {
      nodes: nodes.slice(0, options?.maxNodes || 1000),
      edges,
      clusters,
    };
  }

  /**
   * Create mapping between vocabularies
   */
  static createVocabularyMapping(
    sourceVocabularyId: string,
    targetVocabularyId: string,
    mappings: VocabularyMapping['mappings'],
    creatorId: string
  ): VocabularyMapping {
    const sourceVocabulary = this.getVocabulary(sourceVocabularyId);
    const targetVocabulary = this.getVocabulary(targetVocabularyId);

    const mapping: VocabularyMapping = {
      id: this.generateMappingId(),
      sourceVocabularyId,
      targetVocabularyId,
      mappingType: 'related', // Default
      mappings,
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
    };

    // Validate mappings
    for (const termMapping of mappings) {
      const sourceTerm = sourceVocabulary.terms.find(t => t.id === termMapping.sourceTermId);
      const targetTerm = targetVocabulary.terms.find(t => t.id === termMapping.targetTermId);

      if (!sourceTerm || !targetTerm) {
        throw new Error('Invalid term mapping: source or target term not found');
      }
    }

    sourceVocabulary.mappings.push(mapping);
    sourceVocabulary.lastModified = new Date().toISOString();

    return mapping;
  }

  /**
   * Generate SKOS RDF export
   */
  static exportToSKOS(vocabularyId: string): string {
    const vocabulary = this.getVocabulary(vocabularyId);

    let rdf = `@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix base: <${vocabulary.baseUri}> .

<${vocabulary.baseUri}> a skos:ConceptScheme ;
    dc:title "${vocabulary.name}" ;
    dc:description "${vocabulary.description}" ;
    dc:creator "${vocabulary.governance.owner}" ;
    dc:created "${vocabulary.createdAt}" ;
    dc:modified "${vocabulary.lastModified}" .

`;

    // Export terms as SKOS concepts
    for (const term of vocabulary.terms) {
      rdf += `<${term.uri}> a skos:Concept ;
    skos:inScheme <${vocabulary.baseUri}> ;
    skos:prefLabel "${term.label}"@${vocabulary.language} ;
    skos:definition "${term.definition}"@${vocabulary.language} ;
`;

      if (term.synonyms.length > 0) {
        for (const synonym of term.synonyms) {
          rdf += `    skos:altLabel "${synonym}"@${vocabulary.language} ;\n`;
        }
      }

      if (term.examples.length > 0) {
        for (const example of term.examples) {
          rdf += `    skos:example "${example}"@${vocabulary.language} ;\n`;
        }
      }

      rdf += `    dc:created "${term.createdAt}" ;\n`;
      rdf += `    dc:modified "${term.lastModified}" .\n\n`;
    }

    // Export relationships
    for (const relationship of vocabulary.relationships) {
      const property = this.mapRelationshipToSKOS(relationship.relationshipType);
      if (property) {
        rdf += `<${this.getTermUri(relationship.sourceTermId)}> ${property} <${this.getTermUri(relationship.targetTermId)}> .\n`;
      }
    }

    return rdf;
  }

  /**
   * Import terms from external vocabulary
   */
  static importFromExternal(
    vocabularyId: string,
    externalVocabularyUri: string,
    termUris: string[],
    importerId: string
  ): {
    imported: number;
    failed: number;
    errors: string[];
  } {
    const vocabulary = this.getVocabulary(vocabularyId);
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    if (!this.canUserEditVocabulary(vocabulary, importerId)) {
      throw new Error('User is not authorized to import terms into this vocabulary');
    }

    for (const termUri of termUris) {
      try {
        const externalTerm = this.fetchExternalTerm(termUri);

        if (externalTerm) {
          const localTerm = this.convertExternalTerm(externalTerm, vocabulary);
          vocabulary.terms.push(localTerm);
          imported++;
        } else {
          failed++;
          errors.push(`Failed to fetch term: ${termUri}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error importing ${termUri}: ${error}`);
      }
    }

    vocabulary.imports.push(externalVocabularyUri);
    vocabulary.lastModified = new Date().toISOString();

    return { imported, failed, errors };
  }

  // Private helper methods
  private static validateTerm(term: OntologyTerm, vocabulary: OntologyVocabulary): void {
    // Check for duplicate labels within vocabulary
    const existingTerm = vocabulary.terms.find(t =>
      t.label.toLowerCase() === term.label.toLowerCase() && t.id !== term.id
    );

    if (existingTerm) {
      throw new Error(`Term with label "${term.label}" already exists in vocabulary`);
    }

    // Validate URI format
    if (!this.isValidUri(term.uri)) {
      throw new Error(`Invalid URI format: ${term.uri}`);
    }

    // Validate data type constraints
    if (term.dataType === 'enum' && (!term.allowedValues || term.allowedValues.length === 0)) {
      throw new Error('Enum data type requires allowed values');
    }
  }

  private static canUserEditVocabulary(vocabulary: OntologyVocabulary, userId: string): boolean {
    return vocabulary.governance.owner === userId ||
           vocabulary.governance.maintainers.includes(userId);
  }

  private static calculateRelevance(term: OntologyTerm, query: string, queryType: string): number {
    const normalizedQuery = query.toLowerCase();
    const normalizedLabel = term.label.toLowerCase();
    const normalizedDefinition = term.definition.toLowerCase();

    let score = 0;

    // Exact label match
    if (normalizedLabel === normalizedQuery) {
      score += 100;
    }
    // Partial label match
    else if (normalizedLabel.includes(normalizedQuery)) {
      score += 80;
    }
    // Label starts with query
    else if (normalizedLabel.startsWith(normalizedQuery)) {
      score += 70;
    }

    // Synonym matches
    for (const synonym of term.synonyms) {
      if (synonym.toLowerCase() === normalizedQuery) {
        score += 90;
      } else if (synonym.toLowerCase().includes(normalizedQuery)) {
        score += 60;
      }
    }

    // Definition contains query
    if (normalizedDefinition.includes(normalizedQuery)) {
      score += 40;
    }

    // Apply query type modifiers
    if (queryType === 'conceptual') {
      score *= 1.2; // Boost conceptual matches
    }

    return Math.min(score, 100);
  }

  private static determineMatchType(term: OntologyTerm, query: string): 'exact' | 'partial' | 'semantic' | 'phonetic' {
    const normalizedQuery = query.toLowerCase();
    const normalizedLabel = term.label.toLowerCase();

    if (normalizedLabel === normalizedQuery) {
      return 'exact';
    } else if (normalizedLabel.includes(normalizedQuery)) {
      return 'partial';
    } else {
      return 'semantic';
    }
  }

  private static getMatchedFields(term: OntologyTerm, query: string): string[] {
    const fields: string[] = [];
    const normalizedQuery = query.toLowerCase();

    if (term.label.toLowerCase().includes(normalizedQuery)) {
      fields.push('label');
    }
    if (term.definition.toLowerCase().includes(normalizedQuery)) {
      fields.push('definition');
    }
    if (term.synonyms.some(s => s.toLowerCase().includes(normalizedQuery))) {
      fields.push('synonyms');
    }

    return fields;
  }

  private static findRelatedTerms(
    term: OntologyTerm,
    vocabulary: OntologyVocabulary,
    maxResults: number
  ): Array<{term: OntologyTerm, relationship: string, strength: number}> {
    const related: Array<{term: OntologyTerm, relationship: string, strength: number}> = [];

    for (const relationship of vocabulary.relationships) {
      let relatedTermId: string | undefined;
      let relationshipType = relationship.relationshipType;

      if (relationship.sourceTermId === term.id) {
        relatedTermId = relationship.targetTermId;
      } else if (relationship.targetTermId === term.id && relationship.bidirectional) {
        relatedTermId = relationship.sourceTermId;
        relationshipType = this.getInverseRelationship(relationshipType);
      }

      if (relatedTermId) {
        const relatedTerm = vocabulary.terms.find(t => t.id === relatedTermId);
        if (relatedTerm) {
          related.push({
            term: relatedTerm,
            relationship: relationshipType,
            strength: relationship.confidence,
          });
        }
      }
    }

    return related
      .sort((a, b) => b.strength - a.strength)
      .slice(0, maxResults);
  }

  private static isBidirectionalRelation(relationshipType: string): boolean {
    return ['relatedTo', 'equivalentTo', 'differentFrom'].includes(relationshipType);
  }

  private static getInverseRelationship(relationshipType: string): string {
    const inverses: Record<string, string> = {
      'subClassOf': 'superClassOf',
      'superClassOf': 'subClassOf',
      'partOf': 'hasPart',
      'hasPart': 'partOf',
    };

    return inverses[relationshipType] || relationshipType;
  }

  private static mapRelationshipToSKOS(relationshipType: string): string | null {
    const mapping: Record<string, string> = {
      'subClassOf': 'skos:broader',
      'superClassOf': 'skos:narrower',
      'relatedTo': 'skos:related',
      'equivalentTo': 'skos:exactMatch',
    };

    return mapping[relationshipType] || null;
  }

  private static getClusterColor(domain: string): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    const hash = domain.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private static applyForceDirectedLayout(nodes: ConceptGraph['nodes'], edges: ConceptGraph['edges']): void {
    // Simplified force-directed layout
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].x = Math.random() * 800;
      nodes[i].y = Math.random() * 600;
    }
  }

  private static isValidUri(uri: string): boolean {
    try {
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  }

  private static fetchExternalTerm(termUri: string): any {
    // Mock implementation - in real app, fetch from external source
    return {
      uri: termUri,
      label: 'External Term',
      definition: 'Imported from external vocabulary',
    };
  }

  private static convertExternalTerm(externalTerm: any, vocabulary: OntologyVocabulary): OntologyTerm {
    return {
      id: this.generateTermId(),
      uri: externalTerm.uri,
      label: externalTerm.label,
      definition: externalTerm.definition,
      synonyms: externalTerm.synonyms || [],
      alternativeLabels: externalTerm.alternativeLabels || [],
      examples: externalTerm.examples || [],
      namespace: vocabulary.baseUri,
      category: 'imported',
      status: 'draft',
      version: '1.0.0',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      modifiedBy: 'system',
    };
  }

  private static getVocabulary(vocabularyId: string): OntologyVocabulary {
    // Mock implementation - in real app, fetch from database
    return this.createMockVocabulary(vocabularyId);
  }

  private static getAllVocabularies(): OntologyVocabulary[] {
    // Mock implementation - in real app, fetch from database
    return [this.createMockVocabulary('vocab1')];
  }

  private static getTerm(termId: string): OntologyTerm | undefined {
    const vocabularies = this.getAllVocabularies();
    for (const vocab of vocabularies) {
      const term = vocab.terms.find(t => t.id === termId);
      if (term) return term;
    }
    return undefined;
  }

  private static getVocabularyByTermId(termId: string): OntologyVocabulary {
    const vocabularies = this.getAllVocabularies();
    for (const vocab of vocabularies) {
      if (vocab.terms.some(t => t.id === termId)) {
        return vocab;
      }
    }
    throw new Error('Vocabulary not found for term');
  }

  private static getTermUri(termId: string): string {
    const term = this.getTerm(termId);
    return term?.uri || '';
  }

  private static createMockVocabulary(id: string): OntologyVocabulary {
    return {
      id,
      name: 'SKK Migas Oil & Gas Vocabulary',
      description: 'Standard vocabulary for oil and gas industry terms',
      purpose: 'Standardize terminology across oil and gas operations',
      domain: 'oil-and-gas',
      scope: 'industry',
      baseUri: `https://vocabulary.ids-portal.com/${id}/`,
      version: '1.0.0',
      language: 'en',
      license: 'CC BY 4.0',
      terms: [],
      relationships: [],
      imports: [],
      exports: [],
      mappings: [],
      compliance: {
        standards: ['SKOS', 'Dublin Core'],
        certifications: [],
      },
      usage: {
        linkedDatasets: [],
        applications: [],
        downloadCount: 0,
      },
      governance: {
        owner: 'admin',
        maintainers: ['admin'],
        reviewers: [],
        updateFrequency: 'monthly',
      },
      metadata: {
        keywords: ['oil', 'gas', 'petroleum', 'energy'],
        topics: ['exploration', 'production', 'refining'],
      },
      status: 'published',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  }

  private static generateVocabularyId(): string {
    return `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateTermId(): string {
    return `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateRelationshipId(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateMappingId(): string {
    return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default OntologyManagementService;