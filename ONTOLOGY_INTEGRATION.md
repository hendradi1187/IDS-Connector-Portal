# Ontology Management & Integration

## Overview

The Ontology Management system provides a structured way to define, manage, and integrate vocabularies, concepts, and their relationships across the IDS Connector Portal. It bridges Vocabulary standards, MDM (Master Data Management) domains, and Resource metadata through concept mappings and semantic relationships.

## Architecture

### Core Components

1. **Vocabulary**: Container for related concepts
   - Defines namespace and versioning
   - Groups concepts by domain (e.g., SKK Migas Data Vocabulary, Geological Terms)
   - Status tracking (Active, Draft, Deprecated)

2. **Concept**: Individual terms/definitions within a vocabulary
   - Unique code and label
   - Detailed definition
   - Optional notation (abbreviation)
   - Hierarchical relationships (broader/narrower)
   - Semantic relationships (related, exactMatch, closeMatch)

3. **Ontology Relations**: Typed relationships between entities
   - Hierarchical (broader, narrower, partOf)
   - Semantic (related, exactMatch, closeMatch)
   - Integration (mappedTo, references)

4. **Concept Mappings**: Links concepts to implementation
   - MDM domain mappings (working-area, seismic, well, field, facility)
   - Resource type mappings
   - Field-level mappings with values

## Integration Points

### 1. Vocabulary → MDM Integration

Concepts from vocabularies can be mapped to MDM domain fields:

**Example**: Working Area Status Vocabulary
```
Vocabulary: SKK Migas Status Terms
Concept: AKTIF
  ↓ mappedTo
MDM Domain: working-area
Field: statusWk
Value: "AKTIF"
```

This enables:
- Standardized terminology across systems
- Validation of MDM data against vocabulary
- Automated data quality checks
- Consistent reporting and analytics

### 2. Vocabulary → Resources Integration

Concepts can define resource types and their characteristics:

**Example**: Resource Type Vocabulary
```
Vocabulary: IDS Resource Types
Concept: GEOJSON_MAP
  ↓ mappedTo
Resource Type: "Peta GeoJSON"
Field: type
```

Benefits:
- Controlled vocabulary for resource classification
- Semantic search capabilities
- Cross-system resource discovery

### 3. MDM ← Relationships → Resources

Ontology relations can express:
- Foreign key relationships (e.g., Well → Field → Working Area)
- Composition (e.g., Facility partOf Field)
- References (e.g., Resource references Working Area)

## Database Schema (Firebase Collections)

### vocabularies
```typescript
{
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'Active' | 'Draft' | 'Deprecated';
  namespace: string;
  concepts: number; // count
  createdAt: string;
  updatedAt: string;
}
```

### concepts
```typescript
{
  id: string;
  vocabularyId: string;
  code: string;
  label: string;
  definition: string;
  notation?: string;
  broader?: string[]; // parent concept IDs
  narrower?: string[]; // child concept IDs
  related?: string[]; // related concept IDs
  status: 'Active' | 'Draft' | 'Deprecated';
  createdAt: string;
  updatedAt: string;
}
```

### ontologyRelations
```typescript
{
  id: string;
  sourceType: 'concept' | 'mdm' | 'resource' | 'field';
  sourceId: string;
  sourceName: string;
  targetType: 'concept' | 'mdm' | 'resource' | 'field';
  targetId: string;
  targetName: string;
  relationType: 'broader' | 'narrower' | 'related' | 'exactMatch' | 'closeMatch' | 'mappedTo' | 'references' | 'partOf';
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
}
```

### conceptMappings
```typescript
{
  id: string;
  conceptId: string;
  conceptLabel: string;
  vocabularyId: string;
  vocabularyName: string;
  // MDM mapping
  mdmDomain?: 'working-area' | 'seismic' | 'well' | 'field' | 'facility';
  mdmField?: string;
  mdmValue?: string;
  // Resource mapping
  resourceType?: string;
  resourceField?: string;
  // Mapping metadata
  mappingType: 'exact' | 'close' | 'broad' | 'narrow';
  status: 'Active' | 'Draft' | 'Deprecated';
  createdAt: string;
  updatedAt: string;
}
```

## Usage Examples

### Creating a Vocabulary for SKK Migas Status Terms

1. Navigate to `/vocabularies`
2. Click "Add Vocabulary"
3. Fill in details:
   ```
   Name: SKK Migas Status Terms
   Description: Standardized status terms for working areas
   Version: 1.0
   Namespace: https://ids-connector.example.com/vocab/status
   Status: Active
   ```

### Adding Concepts

1. Select the vocabulary
2. Navigate to "Concepts" tab
3. Add concepts:
   ```
   Code: AKTIF
   Label: Active Status
   Definition: Working area is currently active and operational
   Notation: ACT
   Status: Active
   ```

### Creating Mappings to MDM

1. Navigate to "Mappings" tab
2. Select concept and target MDM domain
3. Map:
   ```
   Concept: AKTIF (SKK Migas Status Terms)
     ↓ mappedTo
   MDM Domain: working-area
   Field: statusWk
   Value: AKTIF
   Mapping Type: exact
   ```

## RBAC (Role-Based Access Control)

### Admin Role
- Full CRUD on vocabularies, concepts, relations, and mappings
- Can deprecate/activate terms
- Manages ontology structure

### KKKS-Provider Role
- Can create and edit vocabularies and concepts
- Can create mappings for their own data
- Read-only on system vocabularies

### SKK-Consumer Role
- Read-only access to all ontology data
- Can view concepts and relationships
- Can search and browse mappings

## API Integration

All vocabulary operations are handled through Firebase actions:

```typescript
import {
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  createConcept,
  updateConcept,
  deleteConcept,
  createOntologyRelation,
  deleteOntologyRelation,
  createConceptMapping,
  updateConceptMapping,
  deleteConceptMapping,
} from '@/app/vocabularies/actions';
```

## Future Enhancements

1. **Relationship Visualization**: Interactive graph using D3.js or React Flow
2. **SKOS Export**: Export vocabularies in SKOS/RDF format
3. **Automated Mapping Suggestions**: ML-based concept matching
4. **Version Control**: Track changes to vocabularies over time
5. **Import/Export**: Bulk import from CSV/Excel
6. **API Integration**: Expose vocabulary as REST API for external systems
7. **Real-time Validation**: Validate MDM data against mapped concepts
8. **Semantic Search**: Search across concepts and definitions

## Standards Compliance

The system follows established ontology standards:
- **SKOS** (Simple Knowledge Organization System)
- **Dublin Core** for metadata
- **OWL** (Web Ontology Language) concepts
- **RDF** for semantic web integration

## References

- SKK Migas Data Specification v2
- SKOS Primer: https://www.w3.org/TR/skos-primer/
- Ontology Best Practices
