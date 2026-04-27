"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  args: unknown;
  state: string;
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

function getLabel(toolName: string, args: unknown, isDone: boolean): string {
  const a = args && typeof args === "object" ? (args as Record<string, unknown>) : {};
  const path = typeof a.path === "string" ? a.path : "";
  const file = basename(path);
  const command = typeof a.command === "string" ? a.command : "";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isDone ? `Created ${file}` : `Creating ${file}`;
      case "str_replace":
      case "insert":
      case "undo_edit":
        return isDone ? `Edited ${file}` : `Editing ${file}`;
      case "view":
        return isDone ? `Read ${file}` : `Reading ${file}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return isDone ? `Renamed ${file}` : `Renaming ${file}`;
      case "delete":
        return isDone ? `Deleted ${file}` : `Deleting ${file}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone =
    toolInvocation.state === "result" && toolInvocation.result !== undefined;
  const label = getLabel(toolInvocation.toolName, toolInvocation.args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
