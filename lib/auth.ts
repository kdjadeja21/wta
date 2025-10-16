"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/app/firebase";
import { AuthResult } from "./types";
import { createUserProfile } from "./firebaseService";

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sign up new user with Firebase Authentication
 */
export async function signup(
  email: string,
  password: string,
  username?: string,
  includeDemoData: boolean = true,
  firstName?: string,
  lastName?: string
): Promise<AuthResult> {
  if (!email || !password || !username) {
    return { success: false, message: "All fields are required" };
  }

  if (!isValidEmail(email)) {
    return { success: false, message: "Invalid email format" };
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  if (username.length < 3) {
    return { success: false, message: "Username must be at least 3 characters" };
  }

  // Validate username format (alphanumeric, underscores, hyphens)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { success: false, message: "Username can only contain letters, numbers, underscores, and hyphens" };
  }

  // Validate first name and last name if provided
  if (firstName && firstName.trim().length < 2) {
    return { success: false, message: "First name must be at least 2 characters" };
  }

  if (lastName && lastName.trim().length < 2) {
    return { success: false, message: "Last name must be at least 2 characters" };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (firstName && !nameRegex.test(firstName.trim())) {
    return { success: false, message: "First name can only contain letters, spaces, hyphens, and apostrophes" };
  }

  if (lastName && !nameRegex.test(lastName.trim())) {
    return { success: false, message: "Last name can only contain letters, spaces, hyphens, and apostrophes" };
  }

  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore
    await createUserProfile(
      user.uid, 
      email, 
      username, 
      includeDemoData,
      firstName?.trim(),
      lastName?.trim()
    );

    // Sign out user immediately so they can't access the app until verified
    await signOut(auth);

    return {
      success: true,
      message: "Account created! Please check your email to verify your account before logging in.",
    };
  } catch (error: any) {
    console.error("Signup error:", error);
    
    // Handle specific Firebase errors
    if (error.code === "auth/email-already-in-use") {
      return { success: false, message: "User already exists" };
    } else if (error.code === "auth/weak-password") {
      return { success: false, message: "Password is too weak" };
    } else if (error.code === "auth/invalid-email") {
      return { success: false, message: "Invalid email format" };
    }
    
    return { success: false, message: error.message || "Failed to create account" };
  }
}

/**
 * Login user with Firebase Authentication
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      // Sign out the user immediately
      await signOut(auth);
      return { 
        success: false, 
        message: "Please verify your email before logging in. Check your inbox for the verification link." 
      };
    }
    
    return {
      success: true,
      message: "Login successful",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Handle specific Firebase errors
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      return { success: false, message: "Invalid email or password" };
    } else if (error.code === "auth/too-many-requests") {
      return { success: false, message: "Too many failed attempts. Please try again later." };
    }
    
    return { success: false, message: error.message || "Failed to login" };
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Get current Firebase user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Validate weight input
 */
export function validateWeight(weight: number): { valid: boolean; message?: string } {
  if (isNaN(weight)) {
    return { valid: false, message: "Please enter a valid number" };
  }
  
  if (weight <= 0) {
    return { valid: false, message: "Weight must be greater than 0" };
  }
  
  if (weight > 500) {
    return { valid: false, message: "Weight must be less than 500 kg" };
  }
  
  return { valid: true };
}
