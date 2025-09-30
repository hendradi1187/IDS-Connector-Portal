'use server';

import { db, auth } from '@/lib/firebase';
import { User } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export async function addUser(userData: any) {
  try {
    console.log('🔍 Attempting to add user with auth account:', {
      ...userData,
      email: userData.email.substring(0, 3) + '***',
      password: '***'
    });

    // Extract password and user data
    const { password, ...userProfileData } = userData;

    // Validate input data
    if (!userProfileData.name || !userProfileData.email || !userProfileData.role || !userProfileData.organization) {
      throw new Error('Missing required fields: name, email, role, or organization');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userProfileData.email)) {
      throw new Error('Invalid email format');
    }

    console.log('🔐 Creating Firebase Auth account...');

    // Step 1: Create Firebase Auth account with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, userProfileData.email, password);
    const firebaseUser = userCredential.user;

    console.log('✅ Firebase Auth account created with UID:', firebaseUser.uid);

    // Step 2: Create user profile in Firestore using the Firebase Auth UID as document ID
    const userProfileForFirestore = {
      ...userProfileData,
      avatar: `https://picsum.photos/seed/${firebaseUser.uid}/32/32`,
      createdAt: new Date().toISOString(),
    };

    console.log('📝 Creating Firestore user profile...');

    // Use setDoc with the Firebase Auth UID as the document ID
    await setDoc(doc(db, 'users', firebaseUser.uid), userProfileForFirestore);

    console.log('✅ User profile created in Firestore with ID:', firebaseUser.uid);

    return {
      id: firebaseUser.uid,
      ...userProfileForFirestore,
      message: 'User account and profile created successfully'
    };

  } catch (e) {
    console.error('❌ Error adding user:', e);

    // Provide more specific error messages
    if (e instanceof Error) {
      if (e.message.includes('email-already-in-use')) {
        throw new Error('Email address is already registered. Please use a different email.');
      } else if (e.message.includes('permission-denied')) {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else if (e.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (e.message.includes('Invalid email')) {
        throw new Error(e.message);
      } else if (e.message.includes('Missing required fields')) {
        throw new Error(e.message);
      } else if (e.message.includes('Password must be')) {
        throw new Error(e.message);
      } else if (e.message.includes('weak-password')) {
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else {
        throw new Error(`Registration error: ${e.message}`);
      }
    }

    throw new Error('Failed to create user account. Please try again.');
  }
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'avatar' | 'createdAt'>>) {
  try {
    console.log('🔍 Attempting to update user:', { id, ...userData, email: userData.email?.substring(0, 3) + '***' });

    // Validate input data
    if (!id) {
      throw new Error('User ID is required');
    }

    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }
    }

    const userRef = doc(db, 'users', id);
    const updateData = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(userRef, updateData);

    console.log('✅ User successfully updated with ID:', id);
    return { success: true, id, ...updateData };

  } catch (e) {
    console.error('❌ Error updating user:', e);

    if (e instanceof Error) {
      if (e.message.includes('permission-denied')) {
        throw new Error('Permission denied. Please check Firebase security rules.');
      } else if (e.message.includes('not-found')) {
        throw new Error('User not found. The user may have been deleted.');
      } else if (e.message.includes('Invalid email')) {
        throw new Error(e.message);
      } else if (e.message.includes('User ID is required')) {
        throw new Error(e.message);
      } else {
        throw new Error(`Update error: ${e.message}`);
      }
    }

    throw new Error('Failed to update user in database.');
  }
}

export async function deleteUser(id: string) {
  try {
    console.log('🔍 Attempting to delete user with ID:', id);

    // Validate input
    if (!id) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', id);

    // Check if user exists before deletion
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found. The user may have already been deleted.');
    }

    // Delete user profile from Firestore
    await deleteDoc(userRef);

    console.log('✅ User successfully deleted with ID:', id);
    return { success: true, id, message: 'User deleted successfully' };

  } catch (e) {
    console.error('❌ Error deleting user:', e);

    if (e instanceof Error) {
      if (e.message.includes('permission-denied')) {
        throw new Error('Permission denied. You do not have permission to delete users.');
      } else if (e.message.includes('not-found') || e.message.includes('User not found')) {
        throw new Error('User not found. The user may have already been deleted.');
      } else if (e.message.includes('User ID is required')) {
        throw new Error(e.message);
      } else {
        throw new Error(`Delete error: ${e.message}`);
      }
    }

    throw new Error('Failed to delete user from database.');
  }
}
