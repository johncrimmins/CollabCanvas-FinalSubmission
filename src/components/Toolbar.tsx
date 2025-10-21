"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ToolbarProps {
  activeTool?: string;
  onToolSelect?: (tool: string) => void;
}

const tools: { id: string; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "rectangle", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "text", label: "Text" },
];

export function Toolbar({ activeTool = "select", onToolSelect }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2 py-1 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          type="button"
          size="sm"
          variant={activeTool === tool.id ? "default" : "ghost"}
          className={cn(
            "rounded-full px-3",
            activeTool === tool.id
              ? "shadow-lg shadow-slate-300/40 dark:shadow-slate-900/40"
              : ""
          )}
          onClick={() => onToolSelect?.(tool.id)}
        >
          {tool.label}
        </Button>
      ))}
    </div>
  );
}

