"use client";

import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { WeightEntry, UserProfile } from "./types";

// Generate demo weight data (30 days)
export function generateDemoData(): Omit<WeightEntry, "id" | "createdAt">[] {
  const entries: Omit<WeightEntry, "id" | "createdAt">[] = [];
  const today = new Date();
  let currentWeight = 78; // Starting weight

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add realistic variation (±0.3kg)
    const variation = (Math.random() - 0.5) * 0.6;
    currentWeight += variation;
    
    entries.push({
      date: date.toISOString().split('T')[0],
      weight: parseFloat(currentWeight.toFixed(1))
    });
  }

  return entries;
}

// ============== USER PROFILE OPERATIONS ==============

/**
 * Create user profile document
 */
export async function createUserProfile(
  userId: string,
  email: string,
  username?: string,
  includeDemoData: boolean = false
): Promise<void> {
  const profileRef = doc(db, "users", userId, "profile", "data");
  
  // Generate a default username from email if not provided (for backward compatibility)
  const defaultUsername = username || email.split('@')[0];
  
  const profileData = {
    email,
    username: defaultUsername,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(profileRef, profileData);

  // Add demo weight data if requested
  if (includeDemoData) {
    const demoWeights = generateDemoData();
    const batch = writeBatch(db);
    
    demoWeights.forEach((weight) => {
      const weightRef = doc(collection(db, "users", userId, "weights"));
      batch.set(weightRef, {
        ...weight,
        createdAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, "users", userId, "profile", "data");
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Update user profile (height, goalWeight)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "email" | "createdAt">>
): Promise<boolean> {
  try {
    const profileRef = doc(db, "users", userId, "profile", "data");
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}

/**
 * Subscribe to user profile changes (real-time)
 */
export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const profileRef = doc(db, "users", userId, "profile", "data");
  
  const unsubscribe = onSnapshot(
    profileRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error in profile subscription:", error);
      callback(null);
    }
  );
  
  return unsubscribe;
}

// ============== WEIGHT ENTRY OPERATIONS ==============

/**
 * Add or update weight entry
 * If entry exists for the date, update it. Otherwise, create new.
 */
export async function addOrUpdateWeightEntry(
  userId: string,
  date: string,
  weight: number
): Promise<{ success: boolean; id?: string; isUpdate?: boolean }> {
  try {
    // Check if entry exists for this date
    const weightsRef = collection(db, "users", userId, "weights");
    const existingWeights = await getWeightEntries(userId);
    const existingEntry = existingWeights.find(w => w.date === date);

    if (existingEntry && existingEntry.id) {
      // Update existing entry
      const weightRef = doc(db, "users", userId, "weights", existingEntry.id);
      await updateDoc(weightRef, {
        weight,
        updatedAt: serverTimestamp(),
      });
      return { success: true, id: existingEntry.id, isUpdate: true };
    } else {
      // Create new entry
      const newWeightRef = await addDoc(weightsRef, {
        date,
        weight,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: newWeightRef.id, isUpdate: false };
    }
  } catch (error) {
    console.error("Error adding/updating weight entry:", error);
    return { success: false };
  }
}

/**
 * Get all weight entries for a user
 */
export async function getWeightEntries(userId: string): Promise<WeightEntry[]> {
  try {
    const weightsRef = collection(db, "users", userId, "weights");
    const q = query(weightsRef, orderBy("date", "desc"));
    
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const weights: WeightEntry[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as WeightEntry));
          unsubscribe(); // Unsubscribe after first fetch
          resolve(weights);
        },
        (error) => {
          console.error("Error fetching weight entries:", error);
          unsubscribe();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error("Error getting weight entries:", error);
    return [];
  }
}

/**
 * Subscribe to weight entries changes (real-time)
 */
export function subscribeToWeightEntries(
  userId: string,
  callback: (weights: WeightEntry[]) => void
): () => void {
  const weightsRef = collection(db, "users", userId, "weights");
  const q = query(weightsRef, orderBy("date", "desc"));
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const weights: WeightEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as WeightEntry));
      callback(weights);
    },
    (error) => {
      console.error("Error in weights subscription:", error);
      callback([]);
    }
  );
  
  return unsubscribe;
}

/**
 * Update weight entry
 */
export async function updateWeightEntry(
  userId: string,
  weightId: string,
  date: string,
  weight: number
): Promise<boolean> {
  try {
    const weightRef = doc(db, "users", userId, "weights", weightId);
    await updateDoc(weightRef, {
      date,
      weight,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error updating weight entry:", error);
    return false;
  }
}

/**
 * Delete weight entry
 */
export async function deleteWeightEntry(
  userId: string,
  weightId: string
): Promise<boolean> {
  try {
    const weightRef = doc(db, "users", userId, "weights", weightId);
    await deleteDoc(weightRef);
    return true;
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    return false;
  }
}

/**
 * Delete all user data (for reset functionality)
 */
export async function deleteAllUserData(userId: string): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    
    // Get all weight entries
    const weights = await getWeightEntries(userId);
    weights.forEach(weight => {
      if (weight.id) {
        const weightRef = doc(db, "users", userId, "weights", weight.id);
        batch.delete(weightRef);
      }
    });
    
    // Reset profile (keep email, remove height and goalWeight)
    const profileRef = doc(db, "users", userId, "profile", "data");
    batch.update(profileRef, {
      height: null,
      goalWeight: null,
      updatedAt: serverTimestamp(),
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting user data:", error);
    return false;
  }
}

