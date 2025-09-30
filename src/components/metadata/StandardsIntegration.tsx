'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Download, ExternalLink, CheckCircle } from 'lucide-react';

interface StandardsIntegrationProps {
  canManage: boolean;
}

export default function StandardsIntegration({ canManage }: StandardsIntegrationProps) {
  const standards = [
    {
      name: 'OGC API - Features',
      version: 'Part 1: Core 1.0',
      url: 'https://www.ogc.org/standards/ogcapi-features',
      status: 'Integrated',
      compliance: 'full',
      description: 'OGC API for accessing geospatial features via RESTful API',
      features: [
        'GeoJSON output format',
        'WGS 84 coordinate system',
        'Feature collections endpoint',
        'Spatial filtering',
        'Property filtering',
      ],
    },
    {
      name: 'Satu Data Indonesia',
      version: 'v2.0',
      url: 'https://data.go.id',
      status: 'Integrated',
      compliance: 'full',
      description: 'Portal metadata nasional untuk berbagi data pemerintah',
      features: [
        'Metadata catalog',
        'Dataset registration',
        'License management',
        'Organization linking',
        'Update frequency tracking',
      ],
    },
    {
      name: 'ISO 19115',
      version: '2014',
      url: 'https://www.iso.org/standard/53798.html',
      status: 'Partial',
      compliance: 'partial',
      description: 'Geographic information — Metadata',
      features: [
        'Metadata structure',
        'Coordinate reference systems',
        'Data quality information',
        'Spatial representation',
        'Distribution information',
      ],
    },
    {
      name: 'DCAT (Data Catalog Vocabulary)',
      version: '2.0',
      url: 'https://www.w3.org/TR/vocab-dcat-2/',
      status: 'Planned',
      compliance: 'none',
      description: 'W3C vocabulary for interoperable data catalogs',
      features: [
        'Dataset description',
        'Distribution formats',
        'Temporal coverage',
        'Spatial coverage',
        'Access rights',
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Integrated: 'default',
      Partial: 'secondary',
      Planned: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getComplianceBadge = (compliance: string) => {
    const colors: Record<string, string> = {
      full: 'bg-green-600',
      partial: 'bg-orange-600',
      none: 'bg-gray-600',
    };
    return <Badge className={colors[compliance]}>{compliance} compliance</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Standards Integration
          </CardTitle>
          <CardDescription>
            Integration with OGC API, Satu Data Indonesia, dan standar internasional
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {standards.map((standard, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{standard.name}</CardTitle>
                    {getStatusBadge(standard.status)}
                    {getComplianceBadge(standard.compliance)}
                  </div>
                  <CardDescription>
                    {standard.version} • {standard.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={standard.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium mb-2">Supported Features:</p>
                <ul className="space-y-1">
                  {standard.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {canManage && standard.status === 'Integrated' && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* OGC API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>OGC API Endpoints</CardTitle>
          <CardDescription>RESTful endpoints compliant with OGC API - Features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>GET /api/ogc/collections</span>
              <Badge variant="outline">Collections list</Badge>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>GET /api/ogc/collections/working-areas</span>
              <Badge variant="outline">Working areas</Badge>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>GET /api/ogc/collections/wells</span>
              <Badge variant="outline">Wells</Badge>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>GET /api/ogc/collections/fields</span>
              <Badge variant="outline">Fields</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satu Data Indonesia */}
      <Card>
        <CardHeader>
          <CardTitle>Satu Data Indonesia Integration</CardTitle>
          <CardDescription>Publish metadata to national data portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Organization Info:</p>
                <div className="text-sm text-muted-foreground">
                  <p>Nama: SKK Migas</p>
                  <p>Kode: SKKMIGAS</p>
                  <p>Status: Aktif</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Dataset Summary:</p>
                <div className="text-sm text-muted-foreground">
                  <p>Total Datasets: 156</p>
                  <p>Published: 142</p>
                  <p>Last Sync: 2025-01-20</p>
                </div>
              </div>
            </div>
            {canManage && (
              <Button>
                <Globe className="h-4 w-4 mr-2" />
                Sync to Satu Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
