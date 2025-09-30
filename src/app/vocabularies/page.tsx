'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Link2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function VocabulariesPage() {
  const vocabularies = [
    {
      id: '1',
      name: 'SKK Migas Data Vocabulary',
      description: 'Standard vocabulary untuk data hulu migas Indonesia',
      version: 'v2.1',
      status: 'Active',
      concepts: 156,
      lastUpdated: '2024-12-01'
    },
    {
      id: '2',
      name: 'Geological Terms',
      description: 'Terminologi geologi dan geofisika',
      version: 'v1.8',
      status: 'Active',
      concepts: 89,
      lastUpdated: '2024-11-15'
    },
    {
      id: '3',
      name: 'Well Data Ontology',
      description: 'Ontologi untuk data sumur dan completion',
      version: 'v1.3',
      status: 'Draft',
      concepts: 203,
      lastUpdated: '2024-11-28'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Vocabulary Management</h1>
          <p className="text-muted-foreground">
            Kelola vocabulary dan ontology untuk standarisasi data
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vocabulary
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vocabularies.map((vocab) => (
          <Card key={vocab.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{vocab.name}</CardTitle>
                    <Badge variant={vocab.status === 'Active' ? 'default' : 'secondary'}>
                      {vocab.status}
                    </Badge>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{vocab.version}</span>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {vocab.description}
              </CardDescription>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Concepts:</span>
                  <span className="font-medium">{vocab.concepts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{vocab.lastUpdated}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Link2 className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Total Vocabularies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">448</div>
              <div className="text-sm text-muted-foreground">Total Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Active Standards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">In Development</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}