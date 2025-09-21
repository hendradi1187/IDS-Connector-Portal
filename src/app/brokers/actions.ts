'use server';

import { db } from '@/lib/firebase';
import { Broker } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addBroker(broker: Omit<Broker, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'brokers'), broker);
    return { id: docRef.id, ...broker };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add broker to database.');
  }
}

export async function updateBroker(id: string, broker: Partial<Omit<Broker, 'id'>>) {
  try {
    const brokerRef = doc(db, 'brokers', id);
    await updateDoc(brokerRef, broker);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update broker in database.');
  }
}

export async function deleteBroker(id: string) {
    try {
        const brokerRef = doc(db, 'brokers', id);
        await deleteDoc(brokerRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete broker from database.');
    }
}
