"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface SignOutOptions {
  redirectTo?: string;
}

export function useSignOut() {
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const signOutUser = useCallback(
    async (options?: SignOutOptions) => {
      if (signingOut) return;
      setSigningOut(true);
      try {
        await signOut(auth);
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        if (options?.redirectTo) {
          router.push(options.redirectTo);
        }
      } catch (error) {
        const errorObj = error as { message?: string };
        toast({
          title: "Sign out failed",
          description: errorObj.message || "An error occurred while signing out",
          variant: "destructive",
        });
      } finally {
        setSigningOut(false);
      }
    },
    [router, toast, signingOut]
  );

  return { signOutUser, signingOut } as const;
}


