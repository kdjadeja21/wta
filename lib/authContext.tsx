"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import { UserProfile } from "./types";
import { getUserProfile, subscribeToUserProfile } from "./firebaseService";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Refresh profile manually
  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let loadingTimeout: NodeJS.Timeout | null = null;

    // Listen to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Set a safety timeout to prevent infinite loading (10 seconds)
        loadingTimeout = setTimeout(() => {
          console.warn("Profile loading timeout - setting loading to false");
          setLoading(false);
        }, 10000);

        // Subscribe to user profile changes
        unsubscribeProfile = subscribeToUserProfile(
          firebaseUser.uid,
          async (profile) => {
            if (loadingTimeout) {
              clearTimeout(loadingTimeout);
            }
            
            if (profile) {
              setUserProfile(profile);
              setLoading(false);
            } else {
              // Profile doesn't exist, check if we need to create it
              // This handles edge case where user logged in but profile wasn't created
              try {
                const existingProfile = await getUserProfile(firebaseUser.uid);
                if (!existingProfile && firebaseUser.email) {
                  // Create profile for existing user without one
                  await import("./firebaseService").then(async (module) => {
                    await module.createUserProfile(firebaseUser.uid, firebaseUser.email!, false);
                  });
                  // Profile will be picked up by the subscription automatically
                } else {
                  setUserProfile(existingProfile);
                  setLoading(false);
                }
              } catch (error) {
                console.error("Error handling user profile:", error);
                setLoading(false);
              }
            }
          }
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const value = {
    user,
    userProfile,
    loading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

