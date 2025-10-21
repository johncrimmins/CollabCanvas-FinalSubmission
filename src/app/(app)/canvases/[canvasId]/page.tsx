"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const canvasId = params.canvasId as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Construction className="h-8 w-8 text-slate-600 dark:text-slate-400" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Canvas Coming Soon
          </CardTitle>
          <CardDescription className="text-lg">
            Canvas ID: <code className="font-mono font-semibold text-slate-900 dark:text-slate-100">{canvasId}</code>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-3">
            <p className="text-slate-700 dark:text-slate-300">
              This is a placeholder for the collaborative canvas feature.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The full canvas functionality will be implemented in subsequent tasks, including:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside ml-2">
              <li>Real-time presence and cursors</li>
              <li>Shape creation (rectangles, circles)</li>
              <li>Transform operations (move, resize)</li>
              <li>Multi-user collaboration</li>
              <li>Undo/redo functionality</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/")}
              variant="default"
              size="lg"
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Your canvas ID has been saved and can be accessed later
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

