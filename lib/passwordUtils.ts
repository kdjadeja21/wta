"use client";

import {
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/app/firebase";

/**
 * Update user password with re-authentication
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const user = auth.currentUser;

  if (!user || !user.email) {
    return { success: false, message: "No user is currently logged in" };
  }

  if (!currentPassword || !newPassword) {
    return { success: false, message: "All fields are required" };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "New password must be at least 6 characters" };
  }

  if (currentPassword === newPassword) {
    return { success: false, message: "New password must be different from current password" };
  }

  try {
    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await firebaseUpdatePassword(user, newPassword);

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error: any) {
    console.error("Password update error:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      return { success: false, message: "Current password is incorrect" };
    } else if (error.code === "auth/weak-password") {
      return { success: false, message: "New password is too weak" };
    } else if (error.code === "auth/requires-recent-login") {
      return { success: false, message: "Please log out and log back in, then try again" };
    }

    return { success: false, message: error.message || "Failed to update password" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!email) {
    return { success: false, message: "Email is required" };
  }

  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch (error: any) {
    console.error("Password reset error:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/user-not-found") {
      return { success: false, message: "No account found with this email" };
    } else if (error.code === "auth/invalid-email") {
      return { success: false, message: "Invalid email format" };
    } else if (error.code === "auth/too-many-requests") {
      return { success: false, message: "Too many requests. Please try again later." };
    }

    return { success: false, message: error.message || "Failed to send reset email" };
  }
}

