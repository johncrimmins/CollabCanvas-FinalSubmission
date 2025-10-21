"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JoinCanvasCard() {
  const router = useRouter();
  const { toast } = useToast();
  const [canvasId, setCanvasId] = useState("");

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

  return (
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
  );
}


