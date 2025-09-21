'use server';

import { db } from '@/lib/firebase';
import { Contract } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addContract(contract: Omit<Contract, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'contracts'), contract);
    return { id: docRef.id, ...contract };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add contract to database.');
  }
}

export async function updateContract(id: string, contract: Partial<Omit<Contract, 'id'>>) {
  try {
    const contractRef = doc(db, 'contracts', id);
    await updateDoc(contractRef, contract);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update contract in database.');
  }
}

export async function deleteContract(id: string) {
    try {
        const contractRef = doc(db, 'contracts', id);
        await deleteDoc(contractRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete contract from database.');
    }
}
