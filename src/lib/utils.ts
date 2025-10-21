import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CollabCanvas: generate a short, URL-friendly canvas ID
export function generateCanvasId(length: number = 12): string {
  return nanoid(length)
}
