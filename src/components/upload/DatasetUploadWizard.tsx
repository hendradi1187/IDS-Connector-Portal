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
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Database,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DatasetMetadataForm from './DatasetMetadataForm';
import FileUploadStep from './FileUploadStep';
import DataQualityValidation from './DataQualityValidation';
import SubmissionSummary from './SubmissionSummary';

interface UploadState {
  currentStep: number;
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
  files: File[];
  validationResults: {
    passed: boolean;
    issues: string[];
    recommendations: string[];
  };
  submitted: boolean;
}

const steps = [
  {
    id: 1,
    title: 'Dataset Metadata',
    description: 'Provide comprehensive dataset information',
    icon: FileText,
  },
  {
    id: 2,
    title: 'File Upload',
    description: 'Upload your dataset files',
    icon: Upload,
  },
  {
    id: 3,
    title: 'Quality Validation',
    description: 'Automatic quality checks and validation',
    icon: Shield,
  },
  {
    id: 4,
    title: 'Review & Submit',
    description: 'Review and submit for approval',
    icon: CheckCircle,
  },
];

export default function DatasetUploadWizard() {
  const [state, setState] = useState<UploadState>({
    currentStep: 1,
    metadata: {
      name: '',
      description: '',
      dataType: '',
      format: '',
      organization: '',
      contactPerson: '',
      contactEmail: '',
      geographicCoverage: '',
      temporalCoverage: '',
      license: '',
      keywords: [],
      accessLevel: 'RESTRICTED',
    },
    files: [],
    validationResults: {
      passed: false,
      issues: [],
      recommendations: [],
    },
    submitted: false,
  });

  const { toast } = useToast();

  const updateMetadata = (metadata: Partial<UploadState['metadata']>) => {
    setState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...metadata },
    }));
  };

  const updateFiles = (files: File[]) => {
    setState(prev => ({ ...prev, files }));
  };

  const nextStep = () => {
    if (state.currentStep < steps.length) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const validateStep = () => {
    switch (state.currentStep) {
      case 1:
        return state.metadata.name && state.metadata.description && state.metadata.dataType;
      case 2:
        return state.files.length > 0;
      case 3:
        return state.validationResults.passed;
      default:
        return true;
    }
  };

  const submitDataset = async () => {
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState(prev => ({ ...prev, submitted: true }));

      toast({
        title: 'Dataset Submitted Successfully',
        description: 'Your dataset has been submitted for review and will be processed within 1-2 business days.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Failed to submit dataset. Please try again.',
      });
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <DatasetMetadataForm
            metadata={state.metadata}
            updateMetadata={updateMetadata}
          />
        );
      case 2:
        return (
          <FileUploadStep
            files={state.files}
            updateFiles={updateFiles}
            expectedFormat={state.metadata.format}
          />
        );
      case 3:
        return (
          <DataQualityValidation
            files={state.files}
            metadata={state.metadata}
            onValidationComplete={(results) =>
              setState(prev => ({ ...prev, validationResults: results }))
            }
          />
        );
      case 4:
        return (
          <SubmissionSummary
            metadata={state.metadata}
            files={state.files}
            validationResults={state.validationResults}
            onSubmit={submitDataset}
            submitted={state.submitted}
          />
        );
      default:
        return null;
    }
  };

  if (state.submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Dataset Submitted Successfully!</CardTitle>
            <CardDescription>
              Your dataset has been submitted for review by the SKK Migas team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="font-medium">What happens next?</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your submission will be reviewed within 1-2 business days</li>
                <li>• You'll receive an email notification about the approval status</li>
                <li>• If approved, your dataset will be available in the portal</li>
                <li>• If changes are needed, we'll provide detailed feedback</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">Submission Details</div>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Dataset: {state.metadata.name}</div>
                <div>Type: {state.metadata.dataType}</div>
                <div>Files: {state.files.length} file(s)</div>
                <div>Submitted: {new Date().toLocaleString('id-ID')}</div>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Submit Another Dataset
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Dataset Upload & Registration
          </CardTitle>
          <CardDescription>
            Submit your dataset following the IDS (International Data Spaces) metadata template for SKK Migas compliance.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const isActive = step.id === state.currentStep;
                const isCompleted = step.id < state.currentStep;
                const IconComponent = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${isActive ? 'bg-primary text-primary-foreground' :
                        isCompleted ? 'bg-green-600 text-white' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Progress value={(state.currentStep / steps.length) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[state.currentStep - 1]?.title}</CardTitle>
          <CardDescription>{steps[state.currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={state.currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {state.currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={submitDataset}
                disabled={!validateStep()}
              >
                Submit Dataset
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Validation Message */}
          {!validateStep() && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Please complete all required fields before proceeding.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}