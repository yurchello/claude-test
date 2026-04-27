# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server (Next.js + Turbopack + node-compat shim)

# Build & production
npm run build
npm start

# Testing
npm test             # Vitest (all tests)
npm test -- <file>   # Run a single test file

# Linting
npm run lint

# Database
npm run setup        # Install deps + prisma generate + prisma migrate dev
npm run db:reset     # Reset SQLite DB and re-run migrations
```

## Architecture

**UIGen** is a Next.js 15 (App Router) AI-powered React component generator. Users describe components in chat; Claude generates code that populates an in-memory virtual file system and renders instantly in a live preview iframe.

### Request flow

1. User sends a message in `ChatInterface` → POST to `/api/chat/route.ts`
2. Server composes: system prompt + serialized virtual FS + chat history → Claude API (streaming, with prompt caching)
3. Claude responds with text and tool calls (`str_replace_editor`, `file_manager`)
4. Tool calls execute against `VirtualFileSystem` (in-memory, no disk writes)
5. Updated FS is pushed back via `FileSystemContext` → `PreviewFrame` hot-reloads
6. If authenticated, the project (messages + serialized FS) is persisted to SQLite via Prisma

### Key files

| Path | Role |
|---|---|
| `src/app/api/chat/route.ts` | Streaming chat endpoint; orchestrates Claude, tool execution, DB persistence |
| `src/lib/file-system.ts` | `VirtualFileSystem` class — canonical in-memory FS |
| `src/lib/provider.ts` | LLM factory — returns real Claude or `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent |
| `src/lib/tools/str-replace.ts` | `str_replace_editor` tool (create/view/str_replace/insert) |
| `src/lib/tools/file-manager.ts` | `file_manager` tool (rename/delete) |
| `src/lib/contexts/FileSystemContext.tsx` | React context owning FS state; consumed by PreviewFrame and FileTree |
| `src/lib/contexts/ChatContext.tsx` | Chat state + `useChat()` integration |
| `src/lib/auth.ts` | JWT session management via `jose` + cookies |
| `src/actions/index.ts` | Server actions: `signUp`, `signIn`, `signOut`, `getUser` |
| `src/app/page.tsx` | Landing — redirects authenticated users to their latest project |
| `src/app/[projectId]/page.tsx` | Protected project page |
| `src/middleware.ts` | Guards `/api/projects` and `/api/filesystem` routes |

### Database

Schema: `src/generated/prisma/schema.prisma`. Prisma + SQLite. Two models: `User` (email, bcrypt password) and `Project` (name, userId, messages as JSON, serialized FS snapshot as JSON). Sessions use JWT cookies.

### AI integration

- Model: Claude Haiku 4.5 via `@ai-sdk/anthropic` + Vercel AI SDK
- Prompt caching is enabled on the system prompt and file-system context blocks
- When `ANTHROPIC_API_KEY` is empty, `provider.ts` returns a `MockLanguageModel` with static responses so the app runs without credentials

### Tech stack

- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui (New York / Neutral), Monaco Editor, Radix UI
- **Backend:** Next.js API routes, Prisma 6, SQLite
- **Testing:** Vitest 3, React Testing Library, JSDOM
- **Path alias:** `@/*` → `src/*`
