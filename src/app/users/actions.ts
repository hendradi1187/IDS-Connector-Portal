'use server';

import { db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function addUser(user: Omit<User, 'id' | 'avatar' | 'createdAt'>) {
  try {
    console.log('🔍 Attempting to add user:', { ...user, email: user.email.substring(0, 3) + '***' });

    // Validate input data
    if (!user.name || !user.email || !user.role || !user.organization) {
      throw new Error('Missing required fields: name, email, role, or organization');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error('Invalid email format');
    }

    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      avatar: `https://picsum.photos/seed/${Math.random()}/32/32`,
      createdAt: new Date().toISOString(),
    });

    console.log('✅ User successfully added with ID:', docRef.id);
    return { id: docRef.id, ...user };
  } catch (e) {
    console.error('❌ Error adding user:', e);

    // Provide more specific error messages
    if (e instanceof Error) {
      if (e.message.includes('permission-denied')) {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else if (e.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (e.message.includes('Invalid email')) {
        throw new Error(e.message);
      } else if (e.message.includes('Missing required fields')) {
        throw new Error(e.message);
      } else {
        throw new Error(`Database error: ${e.message}`);
      }
    }

    throw new Error('Failed to add user to database. Please try again.');
  }
}

export async function updateUser(id: string, user: Partial<Omit<User, 'id' | 'avatar' | 'createdAt'>>) {
  try {
    const userRef = doc(db, 'users', id);
    const updateData = { ...user };
    await updateDoc(userRef, updateData);
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
