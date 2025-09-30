'use server';

import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { UserPreferences } from '@/lib/types';

export async function saveUserPreferences(preferences: UserPreferences) {
  try {
    const preferencesData = {
      ...preferences,
      updatedAt: new Date().toISOString(),
    };

    // Use userId as document ID for easy retrieval
    const docRef = doc(db, 'userPreferences', preferences.userId);
    await setDoc(docRef, preferencesData);

    revalidatePath('/gui');
    return { success: true, message: 'Preferences saved successfully' };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, message: 'Failed to save preferences. Please try again.' };
  }
}

export async function getUserPreferences(userId: string) {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as UserPreferences };
    } else {
      // Return null if no preferences found (will use defaults)
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    return { success: false, message: 'Failed to load preferences' };
  }
}

export async function resetUserPreferences(userId: string) {
  try {
    const defaultPreferences: UserPreferences = {
      userId,
      theme: {
        mode: 'system',
        primaryColor: '#0ea5e9',
        accentColor: '#3b82f6',
        fontSize: 'medium',
        fontFamily: 'system',
        borderRadius: 'medium',
        compactMode: false,
      },
      display: {
        language: 'id',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        timezone: 'Asia/Jakarta',
        numberFormat: 'id',
        currencyFormat: 'IDR',
        coordinateFormat: 'decimal',
        showTooltips: true,
        animationsEnabled: true,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        notifyOnApproval: true,
        notifyOnReject: true,
        notifyOnComment: true,
        notifyOnMention: true,
        notifyOnDataUpdate: false,
        notifyOnSystemAlert: true,
        digestFrequency: 'daily',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
      },
      dashboard: {
        defaultView: 'overview',
        layout: 'grid',
        cardsPerRow: 3,
        showQuickActions: true,
        showStatistics: true,
        showRecentActivity: true,
        autoRefresh: false,
        refreshInterval: 300,
        pinnedItems: [],
      },
      accessibility: {
        highContrast: false,
        reduceMotion: false,
        screenReaderOptimized: false,
        keyboardNavigationOnly: false,
        focusIndicator: 'default',
      },
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'userPreferences', userId);
    await setDoc(docRef, defaultPreferences);

    revalidatePath('/gui');
    return { success: true, data: defaultPreferences, message: 'Preferences reset to defaults' };
  } catch (error) {
    console.error('Error resetting preferences:', error);
    return { success: false, message: 'Failed to reset preferences' };
  }
}
