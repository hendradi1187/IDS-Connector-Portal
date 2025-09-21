'use server';

import { db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';

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
