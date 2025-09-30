'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { Vocabulary } from '@/lib/types';

interface OntologyGraphProps {
  vocabularies: Vocabulary[];
}

export default function OntologyGraph({ vocabularies }: OntologyGraphProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Visualize relationships between concepts across vocabularies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ZoomIn className="h-4 w-4 mr-1" />
            Zoom In
          </Button>
          <Button variant="outline" size="sm">
            <ZoomOut className="h-4 w-4 mr-1" />
            Zoom Out
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-1" />
            Fullscreen
          </Button>
        </div>
      </div>

      <div className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 rounded-lg h-[500px] flex items-center justify-center">
        <div className="text-center">
          <Network className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Ontology Graph Visualization</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Interactive graph visualization will be implemented here using D3.js or React Flow
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Badge variant="default">Broader</Badge>
            <Badge variant="secondary">Narrower</Badge>
            <Badge variant="outline">Related</Badge>
            <Badge>Mapped To</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Hierarchical</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Semantic</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">References</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Mappings</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
