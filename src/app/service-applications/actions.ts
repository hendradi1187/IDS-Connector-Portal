'use server';

import { db } from '@/lib/firebase';
import { ServiceApplication } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addServiceApplication(serviceApp: Omit<ServiceApplication, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'service-applications'), serviceApp);
    return { id: docRef.id, ...serviceApp };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add service application to database.');
  }
}

export async function updateServiceApplication(id: string, serviceApp: Partial<Omit<ServiceApplication, 'id'>>) {
  try {
    const serviceAppRef = doc(db, 'service-applications', id);
    await updateDoc(serviceAppRef, serviceApp);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update service application in database.');
  }
}

export async function deleteServiceApplication(id: string) {
    try {
        const serviceAppRef = doc(db, 'service-applications', id);
        await deleteDoc(serviceAppRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete service application from database.');
    }
}
