'use server';

import { db } from '@/lib/firebase';
import { Route } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addRoute(route: Omit<Route, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'routes'), route);
    return { id: docRef.id, ...route };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add route to database.');
  }
}

export async function updateRoute(id: string, route: Partial<Omit<Route, 'id'>>) {
  try {
    const routeRef = doc(db, 'routes', id);
    await updateDoc(routeRef, route);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update route in database.');
  }
}

export async function deleteRoute(id: string) {
    try {
        const routeRef = doc(db, 'routes', id);
        await deleteDoc(routeRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete route from database.');
    }
}
