'use server';

import { db } from '@/lib/firebase';
import { Resource } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addResource(resource: Omit<Resource, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'resources'), resource);
    return { id: docRef.id, ...resource };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add resource to database.');
  }
}

export async function updateResource(id: string, resource: Partial<Omit<Resource, 'id'>>) {
  try {
    const resourceRef = doc(db, 'resources', id);
    await updateDoc(resourceRef, resource);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update resource in database.');
  }
}

export async function deleteResource(id: string) {
    try {
        const resourceRef = doc(db, 'resources', id);
        await deleteDoc(resourceRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete resource from database.');
    }
}
