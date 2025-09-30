'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

type UpdateProfileData = {
  name?: string;
  email?: string;
  organization?: string;
};

export async function updateProfile(userId: string, data: UpdateProfileData) {
  try {
    console.log('🔍 Attempting to update profile for user ID:', userId);

    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate data fields
    if (data.name && data.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }
    }

    if (data.organization && data.organization.length < 2) {
      throw new Error('Organization must be at least 2 characters');
    }

    const userRef = doc(db, 'users', userId);

    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    // RBAC: Users can only update their own profile
    // The userId should be from the authenticated session (verified by client)
    // Additional server-side verification can be added here with auth tokens

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userRef, updateData);

    console.log('✅ Profile successfully updated for user ID:', userId);

    // Revalidate relevant paths
    revalidatePath('/profile');

    return { success: true, userId, message: 'Profile updated successfully' };

  } catch (e) {
    console.error('❌ Error updating profile:', e);

    if (e instanceof Error) {
      if (e.message.includes('permission-denied')) {
        throw new Error('Permission denied. You can only update your own profile.');
      } else if (e.message.includes('not-found') || e.message.includes('User not found')) {
        throw new Error('User not found.');
      } else if (
        e.message.includes('User ID is required') ||
        e.message.includes('Name must be') ||
        e.message.includes('Invalid email') ||
        e.message.includes('Organization must be')
      ) {
        throw new Error(e.message);
      } else {
        throw new Error(`Update error: ${e.message}`);
      }
    }

    throw new Error('Failed to update profile.');
  }
}