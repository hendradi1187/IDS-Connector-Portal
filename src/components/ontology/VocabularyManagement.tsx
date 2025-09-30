'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Network,
  GitBranch,
  Link2,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import type { Vocabulary, Concept, OntologyStats } from '@/lib/types';
import { deleteVocabulary, deleteConcept } from '@/app/vocabularies/actions';
import VocabularyForm from './VocabularyForm';
import ConceptForm from './ConceptForm';
import ConceptList from './ConceptList';
import OntologyGraph from './OntologyGraph';

export default function VocabularyManagement() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<Vocabulary | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [stats, setStats] = useState<OntologyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVocabDialog, setShowVocabDialog] = useState(false);
  const [showConceptDialog, setShowConceptDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // RBAC: Define permissions
  const canCreate = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canEdit = user?.role === 'Admin' || user?.role === 'KKKS-Provider';
  const canDelete = user?.role === 'Admin';
  const canView = true; // All roles can view

  useEffect(() => {
    // Fetch vocabularies
    const vocabQuery = query(collection(db, 'vocabularies'), orderBy('createdAt', 'desc'));
    const unsubscribeVocabs = onSnapshot(vocabQuery, (snapshot) => {
      const vocabsData: Vocabulary[] = [];
      snapshot.forEach((doc) => {
        vocabsData.push({ id: doc.id, ...doc.data() } as Vocabulary);
      });
      setVocabularies(vocabsData);
      setLoading(false);
    });

    return () => unsubscribeVocabs();
  }, []);

  useEffect(() => {
    if (selectedVocabulary) {
      // Fetch concepts for selected vocabulary
      const conceptQuery = query(
        collection(db, 'concepts'),
        where('vocabularyId', '==', selectedVocabulary.id),
        orderBy('createdAt', 'desc')
      );
      const unsubscribeConcepts = onSnapshot(conceptQuery, (snapshot) => {
        const conceptsData: Concept[] = [];
        snapshot.forEach((doc) => {
          conceptsData.push({ id: doc.id, ...doc.data() } as Concept);
        });
        setConcepts(conceptsData);
      });

      return () => unsubscribeConcepts();
    }
  }, [selectedVocabulary]);

  useEffect(() => {
    // Calculate stats
    const totalVocabs = vocabularies.length;
    const totalConcepts = vocabularies.reduce((sum, v) => sum + v.concepts, 0);

    setStats({
      totalVocabularies: totalVocabs,
      totalConcepts: totalConcepts,
      totalRelations: 0,
      totalMappings: 0,
      recentlyUpdated: 0,
      integrationCoverage: {
        mdm: 0,
        resources: 0,
        vocabulary: 0,
      },
    });
  }, [vocabularies]);

  const handleDeleteVocabulary = async (vocab: Vocabulary) => {
    try {
      const result = await deleteVocabulary(vocab.id);
      if (result.success) {
        toast({
          title: 'Vocabulary Deleted',
          description: `Vocabulary "${vocab.name}" has been successfully deleted.`,
        });
        if (selectedVocabulary?.id === vocab.id) {
          setSelectedVocabulary(null);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to delete vocabulary',
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

  const handleEditVocabulary = (vocab: Vocabulary) => {
    setSelectedVocabulary(vocab);
    setShowVocabDialog(true);
  };

  const handleViewVocabulary = (vocab: Vocabulary) => {
    setSelectedVocabulary(vocab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Vocabulary & Ontology Management
          </h1>
          <p className="text-muted-foreground">
            Kelola vocabulary, concepts, dan relationships untuk standarisasi data
          </p>
          {user?.role === 'SKK-Consumer' && (
            <Badge variant="outline" className="mt-2">
              Read-only Access
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Dialog open={showVocabDialog} onOpenChange={setShowVocabDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedVocabulary(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vocabulary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedVocabulary ? 'Edit Vocabulary' : 'Add New Vocabulary'}
                  </DialogTitle>
                  <DialogDescription>
                    Create or edit a vocabulary to organize concepts
                  </DialogDescription>
                </DialogHeader>
                <VocabularyForm
                  vocabulary={selectedVocabulary}
                  onSuccess={() => {
                    setShowVocabDialog(false);
                    setSelectedVocabulary(null);
                  }}
                  onCancel={() => {
                    setShowVocabDialog(false);
                    setSelectedVocabulary(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vocabularies</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVocabularies}</div>
              <p className="text-xs text-muted-foreground">Active standards</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConcepts}</div>
              <p className="text-xs text-muted-foreground">All vocabularies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relations</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRelations}</div>
              <p className="text-xs text-muted-foreground">Concept relationships</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mappings</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMappings}</div>
              <p className="text-xs text-muted-foreground">To MDM & Resources</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="vocabularies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vocabularies">Vocabularies</TabsTrigger>
          <TabsTrigger value="concepts">Concepts</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
        </TabsList>

        {/* Vocabularies Tab */}
        <TabsContent value="vocabularies" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Loading vocabularies...</div>
              </CardContent>
            </Card>
          ) : vocabularies.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No vocabularies found. Create one to get started.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vocabularies.map((vocab) => (
                <Card key={vocab.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{vocab.name}</CardTitle>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={vocab.status === 'Active' ? 'default' : 'secondary'}>
                            {vocab.status}
                          </Badge>
                          <Badge variant="outline">{vocab.version}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewVocabulary(vocab)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleEditVocabulary(vocab)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    vocabulary "{vocab.name}" and all its concepts.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteVocabulary(vocab)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{vocab.description}</CardDescription>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Concepts:</span>
                        <span className="font-medium">{vocab.concepts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Namespace:</span>
                        <span className="font-mono text-xs">{vocab.namespace}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewVocabulary(vocab)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
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
          )}
        </TabsContent>

        {/* Concepts Tab */}
        <TabsContent value="concepts" className="space-y-4">
          <ConceptList
            vocabularies={vocabularies}
            selectedVocabulary={selectedVocabulary}
            onSelectVocabulary={setSelectedVocabulary}
            canCreate={canCreate}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ontology Relationships</CardTitle>
              <CardDescription>
                Visualize and manage relationships between concepts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OntologyGraph vocabularies={vocabularies} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Concept Mappings</CardTitle>
              <CardDescription>
                Map vocabulary concepts to MDM fields and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Mapping interface will be implemented here</p>
                <p className="text-sm">Connect concepts to MDM domains and resource types</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
