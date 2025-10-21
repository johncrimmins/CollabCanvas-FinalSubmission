"use client";

import { useEffect, useState } from "react";
import {
  subscribeConnectionStatus,
  type Unsubscribe,
} from "@/lib/rtdbClient";

export function useCanvasConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    try {
      unsubscribe = subscribeConnectionStatus(setIsConnected);
    } catch (error) {
      console.error("Failed to subscribe to connection status", error);
    }
    return () => {
      unsubscribe?.();
    };
  }, []);

  return { isConnected } as const;
}

