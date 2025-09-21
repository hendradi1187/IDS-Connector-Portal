'use server';

import { db } from '@/lib/firebase';
import { DataRequest } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addDataRequest(dataRequest: Omit<DataRequest, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'data_requests'), dataRequest);
    return { id: docRef.id, ...dataRequest };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add data request to database.');
  }
}

export async function updateDataRequest(id: string, dataRequest: Partial<Omit<DataRequest, 'id'>>) {
  try {
    const dataRequestRef = doc(db, 'data_requests', id);
    await updateDoc(dataRequestRef, dataRequest);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update data request in database.');
  }
}

export async function deleteDataRequest(id: string) {
    try {
        const dataRequestRef = doc(db, 'data_requests', id);
        await deleteDoc(dataRequestRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete data request from database.');
    }
}
