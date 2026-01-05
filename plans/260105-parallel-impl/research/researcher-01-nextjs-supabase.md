# Next.js 15 App Router + Supabase Integration Research

## 1. Next.js 15 App Router Patterns

### Architecture
- **File-system router** with React Server Components (RSC) by default
- **Streaming-first**: Server sends partial HTML to client as ready (not waiting for full page)
- **Two client types required**: `createServerClient()` (middleware/server components) vs `createBrowserClient()` (client components)

### Layouts & Streaming
```typescript
// app/layout.tsx - Server Component by default
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>
}

// app/loading.tsx - Creates <Suspense> fallback automatically
export default function Loading() {
  return <div>Loading...</div>
}

// app/page.tsx - Server Component with Suspense
export default async function Page() {
  const data = await fetch('...') // Server-side fetch
  return <div>{data}</div>
}
```

### Key Pattern
- Keep **95% as Server Components** (better FCP, smaller JS bundle)
- Import **small Client Components** into Server Components for interactivity
- Use `loading.tsx` for page-level streaming, `<Suspense>` for component-level

---

## 2. Supabase Auth with Next.js SSR

### Migration Path
- **Deprecated**: `@supabase/auth-helpers` → **Use**: `@supabase/ssr` (new standard)
- Two functions: `createServerClient()` (SSR) vs `createBrowserClient()` (client)

### Middleware Setup (CRITICAL)
```typescript
// middleware.ts - Runs before requests complete
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.delete({ name, ...options }),
      },
    }
  )
  // Refresh token & pass to Server Components
  await supabase.auth.getUser()
  return response
}
```

### Why Middleware
- **getSession() is unsafe** in server code (doesn't revalidate token)
- **getUser() is safe** (validates token every call)
- Middleware refreshes expired tokens before Server Components read them
- Prevents token refresh race conditions

---

## 3. Supabase Client Setup: Server vs Client

### Server Component Client
```typescript
// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name) => cookieStore.delete(name),
      },
    }
  )
}

// app/page.tsx - Server Component
import { createClient } from '@/lib/supabase-server'
export default async function Page() {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()
  return <div>{user?.email}</div>
}
```

### Client Component Client
```typescript
// lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// app/client-component.tsx
'use client'
import { createClient } from '@/lib/supabase-client'
export function ClientComponent() {
  const supabase = createClient()
  // Can use hooks, real-time subscriptions
}
```

---

## 4. Real-Time Subscriptions for Streaks

### Two Approaches

**Option A: Postgres Changes (Simpler, Less Scalable)**
```typescript
'use client'
import { createClient } from '@/lib/supabase-client'

export function StreakMonitor() {
  const supabase = createClient()

  useEffect(() => {
    const subscription = supabase
      .channel('streaks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_streaks' },
        (payload) => {
          console.log('Streak updated:', payload.new)
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])
}
```

**Option B: Broadcast with PG Triggers (Scalable, Recommended)**
```sql
-- Create trigger to broadcast on streak updates
CREATE OR REPLACE FUNCTION broadcast_streak_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast(
    'streaks',
    'streak_update',
    json_build_object('user_id', NEW.user_id, 'streak_count', NEW.streak_count)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER streak_broadcast_trigger
AFTER UPDATE ON user_streaks
FOR EACH ROW
EXECUTE FUNCTION broadcast_streak_update();
```

### RLS (Row Level Security) - Critical for Multi-User
```sql
-- Enable RLS on streaks table
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own streaks
CREATE POLICY "Users can read own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Only update own streaks
CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);
```

### Scaling Notes
- **Postgres Changes**: Single-threaded processing; every change requires RLS check per subscriber
- **Broadcast**: Better for high-traffic (10k+ connections); decoupled from DB load
- **Peak connections**: Charged at $10 per 1,000/month

---

## 5. For Dictation App: Quick Checklist

1. **Create middleware.ts** with `createServerClient` for token refresh
2. **Use `@supabase/ssr` package**, NOT auth-helpers
3. **Server Components by default** for data fetching (better perf)
4. **RLS policies** on all user-owned tables (streaks, exercises, progress)
5. **Broadcast for streak updates** if expecting >100 concurrent users; **Postgres Changes** for MVP
6. **Loading boundaries** with `loading.tsx` + `<Suspense>` for smooth streaming UX
7. **Import Client Components sparingly** (exercise player, form inputs)

---

## Sources

- [Next.js App Router Official Docs](https://nextjs.org/docs/app)
- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase @supabase/ssr Package](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Postgres Changes (Real-Time)](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Subscribing to Database Changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
- [Next.js Streaming & Server Components (Medium: Ektakumari)](https://medium.com/@ektakumari8872/next-js-15-and-the-future-of-web-development-in-2026-streaming-server-actions-and-beyond-d0a8f090ce40)
- [Next.js 15 Complete Guide (Medium: Liven Apps)](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
