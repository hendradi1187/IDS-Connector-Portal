'use server';

import { db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addUser(user: Omit<User, 'id' | 'avatar'>) {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      avatar: `https://picsum.photos/seed/${Math.random()}/32/32`,
    });
    return { id: docRef.id, ...user };
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add user to database.');
  }
}

export async function updateUser(id: string, user: Partial<Omit<User, 'id' | 'avatar'>>) {
  try {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, user);
  } catch (e) {
    console.error('Error updating document: ', e);
    throw new Error('Failed to update user in database.');
  }
}

export async function deleteUser(id: string) {
    try {
        const userRef = doc(db, 'users', id);
        await deleteDoc(userRef);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Failed to delete user from database.');
    }
}