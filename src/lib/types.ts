import { User as FirebaseUser } from "firebase/auth";
import type { CanvasObject } from "./validators";
export type { CanvasObject } from "./validators";

// Auth types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convert Firebase User to our User type
export function toUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

// Auth form types
export interface SignUpFormData {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Canvas types imported from validators for convenience

