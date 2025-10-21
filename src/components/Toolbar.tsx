"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store";
import { useCanvasInteractionsContext } from "@/context/CanvasInteractionsContext";

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
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const current = onToolSelect ? activeTool : storeTool ?? activeTool;

  const { duplicateSelected, onDeleteSelected } = useCanvasInteractionsContext();

  const hasSelection = selectedIds.length > 0;

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

      {/* Separator */}
      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />

      {/* Object Actions */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="rounded-full px-3"
        disabled={!hasSelection}
        onClick={duplicateSelected}
        title="Duplicate selected objects (Ctrl+D)"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="rounded-full px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
        disabled={!hasSelection}
        onClick={onDeleteSelected}
        title="Delete selected objects (Delete/Backspace)"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );
}

