"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store";

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
  const setTool = useCanvasStore((s) => s.setTool);
  const storeTool = useCanvasStore((s) => s.tool);
  const current = onToolSelect ? activeTool : storeTool ?? activeTool;
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2 py-1 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/80">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          type="button"
          size="sm"
          variant={current === tool.id ? "default" : "ghost"}
          className={cn(
            "rounded-full px-3",
            current === tool.id
              ? "shadow-lg shadow-slate-300/40 dark:shadow-slate-900/40"
              : ""
          )}
          onClick={() => (onToolSelect ? onToolSelect(tool.id) : setTool(tool.id as any))}
        >
          {tool.label}
        </Button>
      ))}
    </div>
  );
}

