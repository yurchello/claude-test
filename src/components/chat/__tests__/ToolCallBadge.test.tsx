import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result",
  result?: unknown
) {
  return { toolCallId: "test-id", toolName, args, state, result };
}

// str_replace_editor — create
test("shows 'Creating <file>' while create is in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/components/Button.tsx",
      }, "call")}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Created <file>' after create completes", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/components/Button.tsx" },
        "result",
        "Success"
      )}
    />
  );
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

// str_replace_editor — str_replace / insert / undo_edit
test.each(["str_replace", "insert", "undo_edit"] as const)(
  "shows 'Editing <file>' while %s is in progress",
  (command) => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", {
          command,
          path: "src/App.tsx",
        }, "call")}
      />
    );
    expect(screen.getByText("Editing App.tsx")).toBeDefined();
  }
);

test("shows 'Edited <file>' after str_replace completes", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "str_replace", path: "src/App.tsx" },
        "result",
        "Success"
      )}
    />
  );
  expect(screen.getByText("Edited App.tsx")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading <file>' while view is in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "src/index.ts",
      }, "call")}
    />
  );
  expect(screen.getByText("Reading index.ts")).toBeDefined();
});

test("shows 'Read <file>' after view completes", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "view", path: "src/index.ts" },
        "result",
        "file contents"
      )}
    />
  );
  expect(screen.getByText("Read index.ts")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming <file>' while rename is in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "src/Old.tsx",
        new_path: "src/New.tsx",
      }, "call")}
    />
  );
  expect(screen.getByText("Renaming Old.tsx")).toBeDefined();
});

test("shows 'Renamed <file>' after rename completes", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "file_manager",
        { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" },
        "result",
        { success: true }
      )}
    />
  );
  expect(screen.getByText("Renamed Old.tsx")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleting <file>' while delete is in progress", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "src/Unused.tsx",
      }, "call")}
    />
  );
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

test("shows 'Deleted <file>' after delete completes", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "file_manager",
        { command: "delete", path: "src/Unused.tsx" },
        "result",
        { success: true }
      )}
    />
  );
  expect(screen.getByText("Deleted Unused.tsx")).toBeDefined();
});

// Unknown tool falls back to raw tool name
test("falls back to raw tool name for unknown tools", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("some_unknown_tool", {}, "result", "ok")}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

// Visual state: spinner vs dot
test("shows spinner while in progress", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/Foo.tsx",
      }, "call")}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Foo.tsx" },
        "result",
        "ok"
      )}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
