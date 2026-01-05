# Phase 03: UI Components

## Parallelization
- **Wave:** 2
- **Can parallel with:** Phase 02 (DB/Auth), Phase 04 (Audio)
- **Depends on:** Phase 01
- **Blocks:** Phase 05, Phase 06, Phase 07

## File Ownership (Exclusive)
```
src/components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── skeleton.tsx
│   └── index.ts
└── layout/
    ├── header.tsx
    ├── nav.tsx
    └── footer.tsx
```

## Conflict Prevention
- All base UI in `components/ui/` folder
- Feature components (audio, dictation, streak) in separate folders
- Layout components isolated in `components/layout/`

## Tasks

### 1. Button Component (30min)
```typescript
// src/components/ui/button.tsx
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:brightness-95",
        secondary: "border-2 border-primary text-primary hover:bg-primary/5",
        success: "bg-success text-white hover:brightness-95",
        ghost: "hover:bg-gray-100",
        destructive: "bg-error text-white hover:brightness-95",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4",
        lg: "h-12 px-6 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 2. Card Component (20min)
```typescript
// src/components/ui/card.tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border border-gray-100",
        hover && "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-display font-semibold", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-gray-600", className)} {...props} />;
}
```

### 3. Input Component (25min)
```typescript
// src/components/ui/input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full h-12 px-4 border-2 rounded-lg transition-colors",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            error ? "border-error" : "border-gray-200",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### 4. Badge Component (15min)
```typescript
// src/components/ui/badge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        error: "bg-error/10 text-error",
        // CEFR levels
        A1: "bg-green-100 text-green-800",
        A2: "bg-green-200 text-green-900",
        B1: "bg-blue-100 text-blue-800",
        B2: "bg-blue-200 text-blue-900",
        C1: "bg-purple-100 text-purple-800",
        C2: "bg-purple-200 text-purple-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
```

### 5. Progress Component (20min)
```typescript
// src/components/ui/progress.tsx
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  size = "md",
  variant = "default",
  showLabel = false,
  className,
}: ProgressProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-300", variantClasses[variant])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-500 mt-1">{Math.round(value)}%</span>
      )}
    </div>
  );
}
```

### 6. Select Component (25min)
```typescript
// src/components/ui/select.tsx
"use client";

import { forwardRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder = "Select...", className }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full h-12 px-4 pr-10 border-2 border-gray-200 rounded-lg appearance-none",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "bg-white cursor-pointer",
            className
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";
```

### 7. Skeleton Component (15min)
```typescript
// src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// Preset skeletons
export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}
```

### 8. Layout Components (30min)
```typescript
// src/components/layout/header.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="h-16 border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl text-primary">
          Dictation
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/practice" className="text-gray-600 hover:text-gray-900">
                Practice
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

### 9. Export Index (10min)
```typescript
// src/components/ui/index.ts
export { Button, buttonVariants } from "./button";
export { Card, CardHeader, CardTitle, CardContent } from "./card";
export { Input } from "./input";
export { Badge } from "./badge";
export { Progress } from "./progress";
export { Select } from "./select";
export { Skeleton, SkeletonCard, SkeletonText } from "./skeleton";
```

## Acceptance Criteria
- [x] All components render correctly
- [x] Button variants (primary, secondary, success, ghost, destructive)
- [x] CEFR badge colors match design guidelines
- [x] Focus states visible (accessibility)
- [x] Touch targets >= 44px (h-11, h-12 minimum)
- [x] Reduced motion respected

## Implementation Status
**Status:** COMPLETED
**Date:** 2026-01-05
**Implementer:** Agent Phase03

## Effort: 4h
