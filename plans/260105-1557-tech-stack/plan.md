---
title: "English Dictation App - Tech Stack Selection"
description: "Optimal stack for audio-centric language learning app with gamification"
status: pending
priority: P1
effort: 2h
branch: main
tags: [tech-stack, architecture, mvp]
created: 2026-01-05
---

# Tech Stack Recommendation: English Dictation Practice App

## Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | **Next.js 15 (App Router)** | SSR/SSG for SEO, React ecosystem, excellent audio libs (Howler.js), built-in API routes reduce complexity |
| **Backend** | **Supabase** | Auth + DB + Storage unified, generous free tier, real-time subscriptions for streaks |
| **Database** | **Supabase PostgreSQL** | Relational fits user progress well, Row Level Security built-in |
| **Audio Storage** | **Cloudflare R2** | Zero egress fees, global CDN, S3-compatible API |
| **Deployment** | **Vercel** | Native Next.js support, edge functions, free hobby tier |

---

## Component Analysis

### 1. Frontend Framework

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Next.js** | SSR, API routes, huge ecosystem | Slightly heavier | **SELECTED** |
| Vue/Nuxt | Simpler reactivity | Smaller audio lib ecosystem | Good alternative |
| Svelte | Smallest bundle | Less mature ecosystem | Risky for MVP |
| Plain React | Flexible | Needs separate backend | Overkill |

**Audio handling:** Use `Howler.js` for cross-browser audio with precise segment control, playback rate adjustment.

### 2. Backend/BaaS

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Supabase** | All-in-one, generous free tier | Vendor lock-in | **SELECTED** |
| Firebase | Mature | Firestore not ideal for relational data | No |
| FastAPI | Full control | More infrastructure to manage | Overkill for MVP |
| Vercel + Next API | Simple | Need separate DB/auth | More setup |

### 3. Database Schema (Supabase PostgreSQL)

```sql
-- Core tables
users (id, email, created_at, settings jsonb)
content (id, level, title, audio_url, transcript, duration)
attempts (id, user_id, content_id, accuracy, wpm, created_at)
streaks (user_id, date, attempts_count, minutes_practiced)
```

### 4. Audio Storage

| Option | Egress Cost | Speed | Verdict |
|--------|-------------|-------|---------|
| **Cloudflare R2** | $0 | Fast (global) | **SELECTED** |
| AWS S3 | $0.09/GB | Fast | Expensive at scale |
| Supabase Storage | Free 1GB | Okay | Limited for audio-heavy |

**Strategy:** Store audio in R2, serve via Cloudflare CDN. Use byte-range requests for segment looping.

### 5. Deployment

| Option | Free Tier | Next.js Support | Verdict |
|--------|-----------|-----------------|---------|
| **Vercel** | 100GB bandwidth | Native | **SELECTED** |
| Netlify | 100GB | Good | Alternative |
| Cloudflare Pages | Unlimited | Beta | Watch for maturity |

---

## Cost Estimates (MVP, 1K MAU)

| Service | Monthly Cost |
|---------|--------------|
| Vercel (Hobby) | $0 |
| Supabase (Free) | $0 |
| Cloudflare R2 (10GB audio) | ~$0.15/mo storage |
| Domain | ~$1/mo |
| **Total** | **~$1-2/mo** |

**Scaling estimate (10K MAU):** ~$25-50/mo (Supabase Pro $25 + increased R2 storage)

---

## Key Technical Decisions

1. **Audio segment looping:** Howler.js `seek()` + `rate()` API, custom React hook
2. **Real-time comparison:** Debounced input diff using `diff-match-patch`
3. **Streak graph:** Lightweight `react-calendar-heatmap` or custom SVG
4. **Mobile-first:** Tailwind CSS + shadcn/ui components
5. **Offline capability:** Consider PWA with `next-pwa` for future

---

## Alternative Stacks

**Budget-conscious:**
- SQLite + Turso (edge DB) + Cloudflare Pages = near-zero cost

**Enterprise-ready:**
- Next.js + PlanetScale + Clerk Auth + AWS = more control, higher cost

---

## Unresolved Questions

1. Will audio files be user-uploaded or curated content only?
2. Multi-language support needed beyond English?
3. Native mobile apps planned (affects tech choices)?
