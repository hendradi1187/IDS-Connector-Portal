'use server';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { Vocabulary, Concept, OntologyRelation, ConceptMapping } from '@/lib/types';

// Vocabulary Actions
export async function createVocabulary(data: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt' | 'concepts'>) {
  try {
    const vocabularyData = {
      ...data,
      concepts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'vocabularies'), vocabularyData);
    revalidatePath('/vocabularies');
    return { success: true, id: docRef.id, message: 'Vocabulary created successfully' };
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    return { success: false, message: 'Failed to create vocabulary' };
  }
}

export async function updateVocabulary(id: string, data: Partial<Vocabulary>) {
  try {
    const vocabularyRef = doc(db, 'vocabularies', id);
    await updateDoc(vocabularyRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Vocabulary updated successfully' };
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return { success: false, message: 'Failed to update vocabulary' };
  }
}

export async function deleteVocabulary(id: string) {
  try {
    // Check if vocabulary has concepts
    const conceptsQuery = query(collection(db, 'concepts'), where('vocabularyId', '==', id));
    const conceptsSnapshot = await getDocs(conceptsQuery);

    if (!conceptsSnapshot.empty) {
      return { success: false, message: 'Cannot delete vocabulary with existing concepts' };
    }

    await deleteDoc(doc(db, 'vocabularies', id));
    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Vocabulary deleted successfully' };
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return { success: false, message: 'Failed to delete vocabulary' };
  }
}

// Concept Actions
export async function createConcept(data: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const conceptData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'concepts'), conceptData);

    // Update vocabulary concept count
    const vocabularyRef = doc(db, 'vocabularies', data.vocabularyId);
    const vocabularyDoc = await getDoc(vocabularyRef);
    if (vocabularyDoc.exists()) {
      const currentCount = vocabularyDoc.data().concepts || 0;
      await updateDoc(vocabularyRef, {
        concepts: currentCount + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath('/vocabularies');
    return { success: true, id: docRef.id, message: 'Concept created successfully' };
  } catch (error) {
    console.error('Error creating concept:', error);
    return { success: false, message: 'Failed to create concept' };
  }
}

export async function updateConcept(id: string, data: Partial<Concept>) {
  try {
    const conceptRef = doc(db, 'concepts', id);
    await updateDoc(conceptRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    // Update vocabulary updatedAt
    if (data.vocabularyId) {
      const vocabularyRef = doc(db, 'vocabularies', data.vocabularyId);
      await updateDoc(vocabularyRef, {
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Concept updated successfully' };
  } catch (error) {
    console.error('Error updating concept:', error);
    return { success: false, message: 'Failed to update concept' };
  }
}

export async function deleteConcept(id: string, vocabularyId: string) {
  try {
    // Check if concept has relationships
    const relationsQuery1 = query(collection(db, 'ontologyRelations'), where('sourceId', '==', id));
    const relationsQuery2 = query(collection(db, 'ontologyRelations'), where('targetId', '==', id));

    const [relations1, relations2] = await Promise.all([
      getDocs(relationsQuery1),
      getDocs(relationsQuery2),
    ]);

    if (!relations1.empty || !relations2.empty) {
      return { success: false, message: 'Cannot delete concept with existing relationships' };
    }

    await deleteDoc(doc(db, 'concepts', id));

    // Update vocabulary concept count
    const vocabularyRef = doc(db, 'vocabularies', vocabularyId);
    const vocabularyDoc = await getDoc(vocabularyRef);
    if (vocabularyDoc.exists()) {
      const currentCount = vocabularyDoc.data().concepts || 0;
      await updateDoc(vocabularyRef, {
        concepts: Math.max(0, currentCount - 1),
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Concept deleted successfully' };
  } catch (error) {
    console.error('Error deleting concept:', error);
    return { success: false, message: 'Failed to delete concept' };
  }
}

// Ontology Relation Actions
export async function createOntologyRelation(data: Omit<OntologyRelation, 'id' | 'createdAt'>) {
  try {
    const relationData = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'ontologyRelations'), relationData);
    revalidatePath('/vocabularies');
    return { success: true, id: docRef.id, message: 'Relation created successfully' };
  } catch (error) {
    console.error('Error creating relation:', error);
    return { success: false, message: 'Failed to create relation' };
  }
}

export async function deleteOntologyRelation(id: string) {
  try {
    await deleteDoc(doc(db, 'ontologyRelations', id));
    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Relation deleted successfully' };
  } catch (error) {
    console.error('Error deleting relation:', error);
    return { success: false, message: 'Failed to delete relation' };
  }
}

// Concept Mapping Actions
export async function createConceptMapping(data: Omit<ConceptMapping, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const mappingData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'conceptMappings'), mappingData);
    revalidatePath('/vocabularies');
    return { success: true, id: docRef.id, message: 'Mapping created successfully' };
  } catch (error) {
    console.error('Error creating mapping:', error);
    return { success: false, message: 'Failed to create mapping' };
  }
}

export async function updateConceptMapping(id: string, data: Partial<ConceptMapping>) {
  try {
    const mappingRef = doc(db, 'conceptMappings', id);
    await updateDoc(mappingRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Mapping updated successfully' };
  } catch (error) {
    console.error('Error updating mapping:', error);
    return { success: false, message: 'Failed to update mapping' };
  }
}

export async function deleteConceptMapping(id: string) {
  try {
    await deleteDoc(doc(db, 'conceptMappings', id));
    revalidatePath('/vocabularies');
    return { success: true, id, message: 'Mapping deleted successfully' };
  } catch (error) {
    console.error('Error deleting mapping:', error);
    return { success: false, message: 'Failed to delete mapping' };
  }
}
