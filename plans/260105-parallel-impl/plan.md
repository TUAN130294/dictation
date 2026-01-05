---
title: "English Dictation App - Parallel Implementation Plan"
description: "8-phase MVP implementation optimized for parallel execution"
status: pending
priority: P1
effort: 32h
branch: main
tags: [implementation, mvp, parallel]
created: 2026-01-05
---

# Parallel Implementation Plan - Dictation App MVP

## Dependency Graph
```
Phase 01 (Foundation) ─┬──> Phase 02 (DB/Auth)  ──┬──> Phase 05 (Browser) ──┐
                       │                          │                         │
                       ├──> Phase 03 (UI)    ─────┤                         ├──> Phase 08 (Polish)
                       │                          │                         │
                       └──> Phase 04 (Audio) ─────┴──> Phase 06 (Dictation) ┤
                                                                            │
                                                  Phase 07 (Gamification) ──┘
```

## Parallel Execution Strategy

| Wave | Phases | Can Run Together | Duration |
|------|--------|------------------|----------|
| 1 | 01 | Foundation only | 3h |
| 2 | 02, 03, 04 | All parallel | 4h |
| 3 | 05, 06, 07 | All parallel | 6h |
| 4 | 08 | Final integration | 4h |

## File Ownership Matrix

| Directory/File | Phase | Conflict Risk |
|----------------|-------|---------------|
| `next.config.ts`, `tailwind.config.ts` | 01 | LOW |
| `lib/supabase/*.ts`, `middleware.ts` | 02 | NONE |
| `components/ui/*` | 03 | NONE |
| `components/audio/*`, `hooks/useAudio.ts` | 04 | NONE |
| `app/(browse)/*`, `components/exercise-card.tsx` | 05 | NONE |
| `app/(practice)/*`, `components/dictation/*` | 06 | NONE |
| `app/(dashboard)/*`, `components/streak/*` | 07 | NONE |
| `app/layout.tsx` (final), `app/page.tsx` | 08 | LOW |

## Phase Summary

| Phase | Title | Effort | Depends On |
|-------|-------|--------|------------|
| 01 | Project Setup | 3h | - |
| 02 | Database & Auth | 4h | 01 |
| 03 | UI Components | 4h | 01 |
| 04 | Audio Player | 5h | 01 |
| 05 | Exercise Browser | 4h | 02, 03 |
| 06 | Dictation Core | 6h | 04, 05 (partial) |
| 07 | Gamification | 4h | 02 |
| 08 | Dashboard & Polish | 4h | 05, 06, 07 |

## Critical Path
`01 -> 02 -> 05 -> 06 -> 08` (17h minimum sequential)

## Tech Stack Quick Ref
- Next.js 15 App Router + Tailwind + shadcn/ui
- Supabase (Auth + PostgreSQL + RLS)
- WaveSurfer.js + diff-match-patch
- Cloudflare R2 + Vercel
