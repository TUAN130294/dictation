# Phase 01: Project Setup

## Parallelization
- **Wave:** 1 (Foundation - must complete first)
- **Can parallel with:** None
- **Blocks:** Phases 02, 03, 04

## File Ownership (Exclusive)
```
/                           # Root config files
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── .gitignore
├── postcss.config.mjs
└── src/
    ├── app/
    │   ├── globals.css
    │   └── layout.tsx      # Base skeleton only
    └── lib/
        └── utils.ts        # cn() helper
```

## Conflict Prevention
- Other phases MUST NOT modify root config files
- `layout.tsx` gets minimal shell; Phase 08 finalizes

## Tasks

### 1. Initialize Next.js 15 Project (30min)
```bash
npx create-next-app@latest dictation-app --typescript --tailwind --eslint --app --src-dir
cd dictation-app
```

### 2. Install Core Dependencies (15min)
```bash
# UI Framework
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Audio & Diff
npm install wavesurfer.js diff-match-patch
npm install -D @types/diff-match-patch

# Icons
npm install lucide-react
```

### 3. Configure Tailwind with Design Tokens (30min)
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1A56DB", light: "#3B82F6", tint: "#EFF6FF" },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        focus: "#8B5CF6",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 4. Setup Global CSS (20min)
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --duration-fast: 150ms;
    --duration-normal: 300ms;
    --easing: cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    @apply bg-gray-50 text-gray-900 font-body;
  }

  h1, h2, h3 { @apply font-display; }
}

@layer utilities {
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
  }
}
```

### 5. Create Base Layout Shell (30min)
```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-display" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-body" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Dictation Practice",
  description: "English listening practice with dictation exercises",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 6. Environment Setup (15min)
```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_R2_PUBLIC_URL=your_r2_url
```

### 7. Utils Helper (10min)
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes apply correctly
- [ ] Google Fonts load (Inter, Source Sans 3, JetBrains Mono)
- [ ] Environment variables template exists
- [ ] TypeScript strict mode enabled

## Effort: 3h
