'use server';

export interface Metadata {
  id: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  source: string;
  owner: string;
  tags?: string[];
  category?: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface CreateMetadataInput {
  title: string;
  description: string;
  schema: Record<string, any>;
  source: string;
  owner: string;
  tags?: string[];
  category?: string;
  domain?: string;
}

export interface UpdateMetadataInput extends Partial<CreateMetadataInput> {
  id: string;
}

// Mock data storage
let metadataStore: Metadata[] = [
  {
    id: '1',
    title: 'Customer Dataset',
    description: 'Customer information and demographics',
    schema: {
      fields: [
        { name: 'customer_id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'created_at', type: 'date', required: true }
      ]
    },
    source: 'CRM System',
    owner: 'user@example.com',
    tags: ['customer', 'crm', 'demographics'],
    category: 'Customer Data',
    domain: 'Sales',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    status: 'approved'
  },
  {
    id: '2',
    title: 'Product Inventory',
    description: 'Product catalog and inventory levels',
    schema: {
      fields: [
        { name: 'product_id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'stock', type: 'number', required: true },
        { name: 'price', type: 'number', required: true }
      ]
    },
    source: 'Warehouse System',
    owner: 'admin@example.com',
    tags: ['product', 'inventory', 'warehouse'],
    category: 'Inventory Data',
    domain: 'Operations',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    status: 'approved'
  },
  {
    id: '3',
    title: 'Sales Transactions',
    description: 'Daily sales transaction records',
    schema: {
      fields: [
        { name: 'transaction_id', type: 'string', required: true },
        { name: 'customer_id', type: 'string', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'date', type: 'date', required: true }
      ]
    },
    source: 'POS System',
    owner: 'user@example.com',
    tags: ['sales', 'transactions', 'revenue'],
    category: 'Transaction Data',
    domain: 'Sales',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    status: 'pending'
  }
];

/**
 * Create new metadata for a dataset
 */
export async function createMetadata(input: CreateMetadataInput): Promise<Metadata> {
  const newMetadata: Metadata = {
    id: Date.now().toString(),
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft'
  };

  metadataStore.push(newMetadata);
  return newMetadata;
}

/**
 * Update existing metadata
 */
export async function updateMetadata(input: UpdateMetadataInput): Promise<Metadata | null> {
  const index = metadataStore.findIndex(m => m.id === input.id);

  if (index === -1) {
    return null;
  }

  const { id, ...updates } = input;
  metadataStore[index] = {
    ...metadataStore[index],
    ...updates,
    updatedAt: new Date()
  };

  return metadataStore[index];
}

/**
 * Delete metadata by ID
 */
export async function deleteMetadata(id: string): Promise<boolean> {
  const index = metadataStore.findIndex(m => m.id === id);

  if (index === -1) {
    return false;
  }

  metadataStore.splice(index, 1);
  return true;
}

/**
 * Get metadata by ID
 */
export async function getMetadataById(id: string): Promise<Metadata | null> {
  return metadataStore.find(m => m.id === id) || null;
}

/**
 * List all metadata
 */
export async function listMetadata(): Promise<Metadata[]> {
  return [...metadataStore];
}

/**
 * Search metadata by name, tags, category, or domain
 */
export async function searchMetadata(query: string): Promise<Metadata[]> {
  const lowerQuery = query.toLowerCase();

  return metadataStore.filter(m =>
    m.title.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery) ||
    m.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    m.category?.toLowerCase().includes(lowerQuery) ||
    m.domain?.toLowerCase().includes(lowerQuery)
  );
}
