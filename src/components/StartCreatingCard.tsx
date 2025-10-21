"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCanvasId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function StartCreatingCard() {
  const router = useRouter();

  const handleCreateCanvas = () => {
    const newCanvasId = generateCanvasId(12);
    router.push(`/canvases/${newCanvasId}`);
  };

  return (
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
  );
}


