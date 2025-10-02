'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetadataFormProps {
  metadata: {
    name: string;
    description: string;
    dataType: string;
    format: string;
    organization: string;
    contactPerson: string;
    contactEmail: string;
    geographicCoverage: string;
    temporalCoverage: string;
    license: string;
    keywords: string[];
    accessLevel: string;
  };
  updateMetadata: (metadata: any) => void;
}

const dataTypes = [
  { value: 'seismic', label: 'Seismic Data' },
  { value: 'well-log', label: 'Well Log Data' },
  { value: 'production', label: 'Production Data' },
  { value: 'geological', label: 'Geological Data' },
  { value: 'geophysical', label: 'Geophysical Data' },
  { value: 'reservoir', label: 'Reservoir Data' },
  { value: 'drilling', label: 'Drilling Data' },
  { value: 'completion', label: 'Completion Data' },
  { value: 'environmental', label: 'Environmental Data' },
  { value: 'economic', label: 'Economic Data' },
];

const dataFormats = [
  { value: 'csv', label: 'CSV (Comma Separated Values)' },
  { value: 'json', label: 'JSON (JavaScript Object Notation)' },
  { value: 'xml', label: 'XML (eXtensible Markup Language)' },
  { value: 'segy', label: 'SEG-Y (Seismic Data Exchange)' },
  { value: 'las', label: 'LAS (Log ASCII Standard)' },
  { value: 'excel', label: 'Excel Spreadsheet' },
  { value: 'parquet', label: 'Parquet (Columnar Storage)' },
  { value: 'hdf5', label: 'HDF5 (Hierarchical Data Format)' },
  { value: 'netcdf', label: 'NetCDF (Network Common Data Form)' },
  { value: 'binary', label: 'Binary Format' },
];

const licenses = [
  { value: 'cc-by', label: 'Creative Commons Attribution (CC BY)' },
  { value: 'cc-by-sa', label: 'Creative Commons Attribution-ShareAlike (CC BY-SA)' },
  { value: 'cc-by-nc', label: 'Creative Commons Attribution-NonCommercial (CC BY-NC)' },
  { value: 'proprietary', label: 'Proprietary License' },
  { value: 'government', label: 'Government Data License' },
  { value: 'restricted', label: 'Restricted Access' },
];

const accessLevels = [
  { value: 'PUBLIC', label: 'Public (Open Access)', description: 'Available to all users' },
  { value: 'RESTRICTED', label: 'Restricted Access', description: 'Requires approval' },
  { value: 'CONFIDENTIAL', label: 'Confidential', description: 'Limited to specific users' },
  { value: 'INTERNAL', label: 'Internal Only', description: 'Organization internal use only' },
];

export default function DatasetMetadataForm({ metadata, updateMetadata }: MetadataFormProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const handleInputChange = (field: string, value: string) => {
    updateMetadata({ [field]: value });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !metadata.keywords.includes(newKeyword.trim())) {
      updateMetadata({
        keywords: [...metadata.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateMetadata({
      keywords: metadata.keywords.filter(k => k !== keyword)
    });
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Basic Information
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Required fields for dataset identification</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Provide basic information about your dataset following IDS metadata standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dataset Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter dataset name"
                  value={metadata.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  placeholder="Organization name"
                  value={metadata.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the dataset"
                rows={4}
                value={metadata.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataType">Data Type *</Label>
                <Select
                  value={metadata.dataType}
                  onValueChange={(value) => handleInputChange('dataType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Data Format *</Label>
                <Select
                  value={metadata.format}
                  onValueChange={(value) => handleInputChange('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Contact details for data inquiries and access requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  placeholder="Contact person name"
                  value={metadata.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={metadata.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coverage and Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage and Classification</CardTitle>
            <CardDescription>
              Specify geographical and temporal coverage of the dataset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="geographicCoverage">Geographic Coverage</Label>
                <Input
                  id="geographicCoverage"
                  placeholder="e.g., Natuna Sea, Indonesia"
                  value={metadata.geographicCoverage}
                  onChange={(e) => handleInputChange('geographicCoverage', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporalCoverage">Temporal Coverage</Label>
                <Input
                  id="temporalCoverage"
                  placeholder="e.g., 2020-2023 or 2023-01-01 to 2023-12-31"
                  value={metadata.temporalCoverage}
                  onChange={(e) => handleInputChange('temporalCoverage', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add keyword and press Enter"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                />
                <Button type="button" onClick={addKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {metadata.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License and Access */}
        <Card>
          <CardHeader>
            <CardTitle>License and Access Control</CardTitle>
            <CardDescription>
              Define how the dataset can be used and who can access it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license">License</Label>
                <Select
                  value={metadata.license}
                  onValueChange={(value) => handleInputChange('license', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenses.map((license) => (
                      <SelectItem key={license.value} value={license.value}>
                        {license.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select
                  value={metadata.accessLevel}
                  onValueChange={(value) => handleInputChange('accessLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex flex-col">
                          <span>{level.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {level.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IDS Compliance Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">IDS Metadata Compliance</p>
                <p>
                  This form follows the International Data Spaces (IDS) metadata template
                  required for SKK Migas data sharing compliance. Fields marked with * are
                  mandatory for submission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}