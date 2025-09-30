'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, GitBranch } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteConcept } from '@/app/vocabularies/actions';
import type { Vocabulary, Concept } from '@/lib/types';
import ConceptForm from './ConceptForm';

interface ConceptListProps {
  vocabularies: Vocabulary[];
  selectedVocabulary: Vocabulary | null;
  onSelectVocabulary: (vocab: Vocabulary | null) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export default function ConceptList({
  vocabularies,
  selectedVocabulary,
  onSelectVocabulary,
  canCreate,
  canEdit,
  canDelete,
}: ConceptListProps) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showConceptDialog, setShowConceptDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedVocabulary) {
      setLoading(true);
      const conceptQuery = query(
        collection(db, 'concepts'),
        where('vocabularyId', '==', selectedVocabulary.id),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(conceptQuery, (snapshot) => {
        const conceptsData: Concept[] = [];
        snapshot.forEach((doc) => {
          conceptsData.push({ id: doc.id, ...doc.data() } as Concept);
        });
        setConcepts(conceptsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setConcepts([]);
    }
  }, [selectedVocabulary]);

  const handleDeleteConcept = async (concept: Concept) => {
    try {
      const result = await deleteConcept(concept.id, concept.vocabularyId);
      if (result.success) {
        toast({
          title: 'Concept Deleted',
          description: `Concept "${concept.label}" has been successfully deleted.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to delete concept',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    }
  };

  const handleEditConcept = (concept: Concept) => {
    setSelectedConcept(concept);
    setShowConceptDialog(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Concepts</CardTitle>
              <CardDescription>Manage concepts within vocabularies</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedVocabulary?.id || ''}
                onValueChange={(value) => {
                  const vocab = vocabularies.find((v) => v.id === value);
                  onSelectVocabulary(vocab || null);
                }}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select vocabulary" />
                </SelectTrigger>
                <SelectContent>
                  {vocabularies.map((vocab) => (
                    <SelectItem key={vocab.id} value={vocab.id}>
                      {vocab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canCreate && selectedVocabulary && (
                <Dialog open={showConceptDialog} onOpenChange={setShowConceptDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedConcept(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Concept
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedConcept ? 'Edit Concept' : 'Add New Concept'}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedConcept
                          ? 'Edit concept details'
                          : `Add a new concept to ${selectedVocabulary.name}`}
                      </DialogDescription>
                    </DialogHeader>
                    <ConceptForm
                      vocabularyId={selectedVocabulary.id}
                      concept={selectedConcept}
                      onSuccess={() => {
                        setShowConceptDialog(false);
                        setSelectedConcept(null);
                      }}
                      onCancel={() => {
                        setShowConceptDialog(false);
                        setSelectedConcept(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedVocabulary ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Select a vocabulary to view and manage concepts</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading concepts...</div>
          ) : concepts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No concepts found in this vocabulary</p>
              {canCreate && <p className="text-sm">Click "Add Concept" to create one</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Definition</TableHead>
                  <TableHead>Notation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concepts.map((concept) => (
                  <TableRow key={concept.id}>
                    <TableCell className="font-mono text-xs">{concept.code}</TableCell>
                    <TableCell className="font-medium">{concept.label}</TableCell>
                    <TableCell className="max-w-md truncate">{concept.definition}</TableCell>
                    <TableCell>
                      {concept.notation && (
                        <Badge variant="outline">{concept.notation}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          concept.status === 'Active'
                            ? 'default'
                            : concept.status === 'Draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {concept.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConcept(concept)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  concept "{concept.label}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteConcept(concept)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
