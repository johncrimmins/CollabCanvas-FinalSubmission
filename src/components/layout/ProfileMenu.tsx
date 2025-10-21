"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/useSignOut";

export function ProfileMenu() {
  const { signOutUser, signingOut } = useSignOut();
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2 py-1 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
      <Link href="/" className="text-sm">
        <Button size="sm" variant="ghost" className="rounded-full px-3">
          My canvases
        </Button>
      </Link>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full px-3"
        onClick={() => signOutUser({ redirectTo: "/auth" })}
        disabled={signingOut}
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}


