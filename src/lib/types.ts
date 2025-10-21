import { User as FirebaseUser } from "firebase/auth";

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

// Canvas types (to be expanded in later tasks)
export interface CanvasObject {
  id: string;
  type: "rect" | "circle" | "text";
  props: {
    x: number;
    y: number;
    w?: number;
    h?: number;
    r?: number;
    rotation?: number;
    text?: string;
    fill?: string;
  };
  v: number; // version for optimistic concurrency control
  updatedBy: string;
  updatedAt: number;
}

