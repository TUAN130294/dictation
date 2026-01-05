# Phase 02: Database & Auth

## Parallelization
- **Wave:** 2
- **Can parallel with:** Phase 03 (UI), Phase 04 (Audio)
- **Depends on:** Phase 01
- **Blocks:** Phase 05, Phase 07

## File Ownership (Exclusive)
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── middleware.ts   # Auth middleware helper
├── middleware.ts           # Next.js middleware
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   └── api/
│       └── auth/
│           └── [...supabase]/route.ts
└── types/
    └── database.ts         # Generated types
```

## Conflict Prevention
- Auth routes isolated in `(auth)` group
- Supabase clients in dedicated `lib/supabase/` folder
- Database types auto-generated, not manually edited

## Tasks

### 1. Supabase Project Setup (30min)
```sql
-- Run in Supabase SQL Editor

-- Users extension (auto-created by Supabase Auth)

-- Content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  transcript TEXT NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attempts table
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_text TEXT NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  wpm INTEGER,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Streaks table
CREATE TABLE streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercises_count INTEGER DEFAULT 0,
  minutes INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_content_level ON content(level);
CREATE INDEX idx_attempts_user ON attempts(user_id, created_at DESC);
CREATE INDEX idx_streaks_user ON streaks(user_id, date DESC);
```

### 2. Row Level Security (20min)
```sql
-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Content: public read
CREATE POLICY "Content is public" ON content FOR SELECT USING (true);

-- Attempts: user owns
CREATE POLICY "Users own attempts" ON attempts FOR ALL
  USING (auth.uid() = user_id);

-- Streaks: user owns
CREATE POLICY "Users own streaks" ON streaks FOR ALL
  USING (auth.uid() = user_id);

-- Achievements: user owns
CREATE POLICY "Users own achievements" ON achievements FOR ALL
  USING (auth.uid() = user_id);
```

### 3. Server Client Setup (30min)
```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}
```

### 4. Browser Client Setup (15min)
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 5. Middleware for Token Refresh (30min)
```typescript
// src/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response.cookies.delete(name);
        },
      },
    }
  );

  // Refresh session (IMPORTANT: use getUser, not getSession)
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes redirect
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
                      request.nextUrl.pathname.startsWith("/signup");
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
                           request.nextUrl.pathname.startsWith("/practice");

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

### 6. Auth Pages (45min)
```typescript
// src/app/(auth)/login/page.tsx
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm">
        <h1 className="text-2xl font-display font-bold text-center mb-6">
          Sign In
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
```

```typescript
// src/app/(auth)/login/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-error text-sm">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:brightness-95 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-12 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50"
      >
        Continue with Google
      </button>
    </form>
  );
}
```

### 7. OAuth Callback (15min)
```typescript
// src/app/(auth)/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

### 8. Generate TypeScript Types (15min)
```bash
# Install CLI
npm install -D supabase

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

## Acceptance Criteria
- [ ] Supabase tables created with RLS enabled (Manual: SQL provided, awaiting user setup)
- [x] Email/password login code implemented
- [x] Google OAuth redirect code implemented
- [x] Protected routes middleware implemented
- [x] Session refresh middleware implemented
- [x] TypeScript types placeholder created

## Implementation Status
- **Status:** Code Complete
- **Date:** 2026-01-05
- **Report:** plans/260105-parallel-impl/reports/phase-02-implementation-report.md

## Effort: 4h
