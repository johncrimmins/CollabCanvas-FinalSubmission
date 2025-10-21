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

export function generateObjectId(): string {
  return `obj-${nanoid(10)}`
}

// Debug logging utility for canvas operations
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data ? { ...data, timestamp: Date.now() } : { timestamp: Date.now() });
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? { ...data, timestamp: Date.now() } : { timestamp: Date.now() });
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? { ...data, timestamp: Date.now() } : { timestamp: Date.now() });
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, { error, timestamp: Date.now(), stack: error?.stack });
  }
};

// Data flow tracing utility
export const trace = {
  state: (operation: string, state: any, context?: string) => {
    logger.debug(`STATE: ${operation}`, { state, context });
  },
  firebase: (operation: string, data: any, context?: string) => {
    logger.debug(`FIREBASE: ${operation}`, { data, context });
  },
  transform: (operation: string, data: any, context?: string) => {
    logger.debug(`TRANSFORM: ${operation}`, { data, context });
  },
  undo: (operation: string, data: any, context?: string) => {
    logger.debug(`UNDO: ${operation}`, { data, context });
  }
};
