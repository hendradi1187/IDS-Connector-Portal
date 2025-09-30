// Debug utility for Firebase connection issues
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    // Test basic Firebase connection
    const testRef = collection(db, 'test');
    const testDoc = await addDoc(testRef, {
      test: true,
      timestamp: new Date().toISOString()
    });

    console.log('✅ Firebase connection successful, test doc ID:', testDoc.id);
    return { success: true, docId: testDoc.id };
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function debugUserRegistration(userData: any) {
  console.log('🔍 Debug: Starting user registration with data:', userData);

  try {
    // Validate Firebase connection first
    const connectionTest = await testFirebaseConnection();
    if (!connectionTest.success) {
      throw new Error(`Firebase connection failed: ${connectionTest.error}`);
    }

    // Try to add user
    const usersRef = collection(db, 'users');
    console.log('🔍 Debug: Users collection reference created');

    const docRef = await addDoc(usersRef, {
      ...userData,
      avatar: `https://picsum.photos/seed/${Math.random()}/32/32`,
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Debug: User successfully added with ID:', docRef.id);
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ Debug: User registration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}