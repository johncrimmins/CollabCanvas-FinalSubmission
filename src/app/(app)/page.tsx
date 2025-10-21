"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { nanoid } from "nanoid";
import { auth, rtdb } from "@/lib/firebase";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, ArrowRight, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthGuard();
  
  const [canvasId, setCanvasId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Listen to RTDB connection status
  useEffect(() => {
    const connectedRef = ref(rtdb, ".info/connected");
    
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });

    return () => unsubscribe();
  }, []);

  // Create new canvas
  const handleCreateCanvas = () => {
    const newCanvasId = nanoid(12); // 12-character ID
    router.push(`/canvases/${newCanvasId}`);
  };

  // Join existing canvas
  const handleJoinCanvas = (e: FormEvent) => {
    e.preventDefault();

    const trimmedId = canvasId.trim();

    if (!trimmedId) {
      toast({
        title: "Invalid Canvas ID",
        description: "Please enter a canvas ID",
        variant: "destructive",
      });
      return;
    }

    if (trimmedId.length < 3) {
      toast({
        title: "Invalid Canvas ID",
        description: "Canvas ID is too short",
        variant: "destructive",
      });
      return;
    }

    router.push(`/canvases/${trimmedId}`);
  };

  // Sign out
  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut(auth);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });

      router.push("/auth");
    } catch (error) {
      const errorObj = error as { message?: string };
      toast({
        title: "Sign out failed",
        description: errorObj.message || "An error occurred while signing out",
        variant: "destructive",
      });
      setSigningOut(false);
    }
  };

  if (!user) {
    return null; // Should not render if not authenticated (layout handles redirect)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                CollabCanvas
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Welcome, {user.displayName || user.email}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isConnected
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                      : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  }`}
                />
                <span className="text-slate-600 dark:text-slate-400">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
                className="gap-2"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Create New Canvas */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Start Creating</CardTitle>
              <CardDescription className="text-base">
                Launch a new collaborative canvas session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateCanvas}
                size="lg"
                className="w-full gap-2 text-lg h-14 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                Create New Canvas
              </Button>
            </CardContent>
          </Card>

          {/* Join Existing Canvas */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Join a Session</CardTitle>
              <CardDescription className="text-base">
                Enter a canvas ID to collaborate with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinCanvas} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="canvasId" className="text-base">
                    Canvas ID
                  </Label>
                  <Input
                    id="canvasId"
                    type="text"
                    placeholder="Enter canvas ID"
                    value={canvasId}
                    onChange={(e) => setCanvasId(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="w-full gap-2 text-lg h-14"
                >
                  Join Canvas
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              Share your canvas ID with team members to collaborate in real-time
            </p>
            <p className="text-xs">
              Canvas sessions are automatically saved and can be accessed anytime
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

