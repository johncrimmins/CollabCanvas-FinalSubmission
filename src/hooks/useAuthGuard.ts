"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, toUser } from "@/lib/types";

interface UseAuthGuardReturn {
  user: User | null;
  loading: boolean;
  firebaseUser: FirebaseUser | null;
}

/**
 * Auth guard hook that listens to Firebase auth state changes
 * Returns the current user, loading state, and raw Firebase user
 */
export function useAuthGuard(): UseAuthGuardReturn {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Subscribe to auth state changes
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (firebaseUser) {
            // User is authenticated
            setFirebaseUser(firebaseUser);
            setUser(toUser(firebaseUser));
          } else {
            // User is not authenticated
            setFirebaseUser(null);
            setUser(null);
          }
          
          setLoading(false);
        },
        (error) => {
          // Handle errors (Firebase not configured, network issues, etc.)
          console.error("Firebase auth error:", error);
          setLoading(false);
          setUser(null);
          setFirebaseUser(null);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      // Handle initialization errors
      console.error("Failed to initialize Firebase auth:", error);
      setLoading(false);
      setUser(null);
      setFirebaseUser(null);
    }
  }, []);

  return { user, loading, firebaseUser };
}

