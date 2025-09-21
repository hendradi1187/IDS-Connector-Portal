'use server';

import { db } from '@/lib/firebase';
import { Config } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addConfig(config: Omit<Config, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'configs'), config);
    return { id: docRef.id, ...config };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add config to database.');
  }
}

export async function updateConfig(id: string, config: Partial<Omit<Config, 'id'>>) {
  try {
    const configRef = doc(db, 'configs', id);
    await updateDoc(configRef, config);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update config in database.');
  }
}

export async function deleteConfig(id: string) {
    try {
        const configRef = doc(db, 'configs', id);
        await deleteDoc(configRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete config from database.');
    }
}
