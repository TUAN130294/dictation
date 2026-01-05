# Phase 06: Dictation Core

## Parallelization
- **Wave:** 3
- **Can parallel with:** Phase 05 (Browser), Phase 07 (Gamification)
- **Depends on:** Phase 04 (Audio Player), Phase 05 (partial - exercise queries)
- **Blocks:** Phase 08

## File Ownership (Exclusive)
```
src/
├── app/
│   └── (practice)/
│       ├── layout.tsx
│       └── practice/
│           └── [id]/
│               ├── page.tsx          # Dictation page
│               └── loading.tsx
├── components/
│   └── dictation/
│       ├── dictation-input.tsx       # Typing area
│       ├── diff-display.tsx          # Visual diff
│       ├── scoring-panel.tsx         # Results
│       └── index.ts
├── hooks/
│   └── use-dictation.ts              # State machine
└── lib/
    ├── diff-utils.ts                 # diff-match-patch wrapper
    └── scoring.ts                    # WER, XP calculation
```

## Conflict Prevention
- Practice pages in `(practice)` route group
- Dictation components separate from audio components
- Diff/scoring utils in `lib/`

## Tasks

### 1. Diff Utilities with diff-match-patch (30min)
```typescript
// src/lib/diff-utils.ts
import DiffMatchPatch from "diff-match-patch";

const dmp = new DiffMatchPatch();

export interface DiffResult {
  diffs: Array<[number, string]>;
  substitutions: number;
  deletions: number;
  insertions: number;
  matches: number;
}

export function computeWordDiff(userText: string, referenceText: string): DiffResult {
  // Normalize texts
  const normalizeText = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, " ");

  const userNorm = normalizeText(userText);
  const refNorm = normalizeText(referenceText);

  // Compute diff
  const diffs = dmp.diff_main(refNorm, userNorm);
  dmp.diff_cleanupSemantic(diffs);

  // Count operations
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;
  let matches = 0;

  for (let i = 0; i < diffs.length; i++) {
    const [op, text] = diffs[i];
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (op === 0) {
      // Match
      matches += wordCount;
    } else if (op === -1) {
      // Deletion from reference (user missed words)
      // Check if next is insertion (substitution)
      if (i + 1 < diffs.length && diffs[i + 1][0] === 1) {
        const nextWords = diffs[i + 1][1].split(/\s+/).filter(Boolean).length;
        substitutions += Math.min(wordCount, nextWords);
        if (wordCount > nextWords) deletions += wordCount - nextWords;
        i++; // Skip next
      } else {
        deletions += wordCount;
      }
    } else if (op === 1) {
      // Insertion (user added extra words)
      insertions += wordCount;
    }
  }

  return { diffs, substitutions, deletions, insertions, matches };
}

export function getDiffSegments(diffs: Array<[number, string]>) {
  return diffs.map(([op, text]) => ({
    text,
    type: op === 0 ? "match" : op === -1 ? "deletion" : "insertion",
  }));
}
```

### 2. Scoring Utilities (25min)
```typescript
// src/lib/scoring.ts
import type { DiffResult } from "./diff-utils";

export interface Score {
  wer: number;          // Word Error Rate (0-1)
  accuracy: number;     // Percentage (0-100)
  xp: number;           // Experience points
  grade: "perfect" | "excellent" | "good" | "fair" | "poor";
}

export function calculateScore(
  diffResult: DiffResult,
  referenceWordCount: number
): Score {
  const { substitutions, deletions, insertions } = diffResult;
  const errors = substitutions + deletions + insertions;

  // WER = (S + D + I) / N
  const wer = referenceWordCount > 0 ? errors / referenceWordCount : 1;
  const accuracy = Math.max(0, Math.round((1 - wer) * 100));

  // Grade based on accuracy
  let grade: Score["grade"];
  if (accuracy >= 100) grade = "perfect";
  else if (accuracy >= 90) grade = "excellent";
  else if (accuracy >= 75) grade = "good";
  else if (accuracy >= 60) grade = "fair";
  else grade = "poor";

  // XP calculation
  const baseXP = 10;
  const accuracyBonus = Math.floor(accuracy / 10);
  const perfectBonus = accuracy === 100 ? 20 : 0;
  const xp = baseXP + accuracyBonus + perfectBonus;

  return { wer, accuracy, xp, grade };
}

export function getGradeColor(grade: Score["grade"]): string {
  const colors = {
    perfect: "text-success",
    excellent: "text-success",
    good: "text-primary",
    fair: "text-warning",
    poor: "text-error",
  };
  return colors[grade];
}

export function getGradeMessage(grade: Score["grade"]): string {
  const messages = {
    perfect: "Perfect! Flawless transcription!",
    excellent: "Excellent work! Almost perfect!",
    good: "Good job! Keep practicing!",
    fair: "Not bad! Try listening more carefully.",
    poor: "Keep trying! Practice makes perfect.",
  };
  return messages[grade];
}
```

### 3. useDictation Hook (45min)
```typescript
// src/hooks/use-dictation.ts
"use client";

import { useState, useCallback, useMemo } from "react";
import { computeWordDiff, type DiffResult } from "@/lib/diff-utils";
import { calculateScore, type Score } from "@/lib/scoring";

type DictationState = "idle" | "practicing" | "reviewing";

interface UseDictationOptions {
  transcript: string;
  onComplete?: (score: Score, userText: string) => void;
}

export function useDictation({ transcript, onComplete }: UseDictationOptions) {
  const [state, setState] = useState<DictationState>("idle");
  const [userText, setUserText] = useState("");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [score, setScore] = useState<Score | null>(null);

  const referenceWordCount = useMemo(
    () => transcript.trim().split(/\s+/).filter(Boolean).length,
    [transcript]
  );

  const start = useCallback(() => {
    setState("practicing");
    setUserText("");
    setDiffResult(null);
    setScore(null);
  }, []);

  const updateText = useCallback((text: string) => {
    setUserText(text);
  }, []);

  const submit = useCallback(() => {
    if (!userText.trim()) return;

    const diff = computeWordDiff(userText, transcript);
    const calculatedScore = calculateScore(diff, referenceWordCount);

    setDiffResult(diff);
    setScore(calculatedScore);
    setState("reviewing");

    onComplete?.(calculatedScore, userText);
  }, [userText, transcript, referenceWordCount, onComplete]);

  const retry = useCallback(() => {
    start();
  }, [start]);

  const reset = useCallback(() => {
    setState("idle");
    setUserText("");
    setDiffResult(null);
    setScore(null);
  }, []);

  // Real-time preview diff (debounced in component)
  const previewDiff = useMemo(() => {
    if (state !== "practicing" || !userText.trim()) return null;
    return computeWordDiff(userText, transcript);
  }, [state, userText, transcript]);

  return {
    state,
    userText,
    diffResult,
    score,
    referenceWordCount,
    previewDiff,
    start,
    updateText,
    submit,
    retry,
    reset,
  };
}
```

### 4. Dictation Input Component (35min)
```typescript
// src/components/dictation/dictation-input.tsx
"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui";

interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DictationInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Type what you hear...",
}: DictationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-4 font-mono text-lg leading-relaxed border-2 border-gray-200 rounded-lg resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Ctrl+Enter to submit</span>
          <Button onClick={onSubmit} disabled={disabled || !value.trim()}>
            Check Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5. Diff Display Component (35min)
```typescript
// src/components/dictation/diff-display.tsx
"use client";

import { getDiffSegments } from "@/lib/diff-utils";
import type { DiffResult } from "@/lib/diff-utils";

interface DiffDisplayProps {
  diffResult: DiffResult;
  showReference?: boolean;
  referenceText?: string;
}

export function DiffDisplay({
  diffResult,
  showReference = true,
  referenceText,
}: DiffDisplayProps) {
  const segments = getDiffSegments(diffResult.diffs);

  return (
    <div className="space-y-4">
      {/* Diff visualization */}
      <div className="p-4 bg-gray-50 rounded-lg font-mono text-lg leading-relaxed">
        {segments.map((segment, i) => (
          <span
            key={i}
            className={
              segment.type === "match"
                ? "text-gray-900"
                : segment.type === "deletion"
                ? "bg-error/20 text-error line-through"
                : "bg-success/20 text-success"
            }
          >
            {segment.text}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-success">
          +{diffResult.insertions} added
        </span>
        <span className="text-error">
          -{diffResult.deletions} missed
        </span>
        <span className="text-warning">
          ~{diffResult.substitutions} wrong
        </span>
        <span className="text-gray-500">
          {diffResult.matches} correct
        </span>
      </div>

      {/* Reference text */}
      {showReference && referenceText && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-primary hover:underline">
            Show correct transcript
          </summary>
          <p className="mt-2 p-4 bg-primary/5 rounded-lg font-body leading-relaxed">
            {referenceText}
          </p>
        </details>
      )}
    </div>
  );
}
```

### 6. Scoring Panel Component (30min)
```typescript
// src/components/dictation/scoring-panel.tsx
"use client";

import { Trophy, Star, RotateCcw, ArrowRight } from "lucide-react";
import { Button, Card, Progress } from "@/components/ui";
import { getGradeColor, getGradeMessage, type Score } from "@/lib/scoring";

interface ScoringPanelProps {
  score: Score;
  onRetry: () => void;
  onNext?: () => void;
}

export function ScoringPanel({ score, onRetry, onNext }: ScoringPanelProps) {
  return (
    <Card className="text-center">
      {/* Grade icon */}
      <div className="mb-4">
        {score.grade === "perfect" || score.grade === "excellent" ? (
          <Trophy className={`h-16 w-16 mx-auto ${getGradeColor(score.grade)}`} />
        ) : (
          <Star className={`h-16 w-16 mx-auto ${getGradeColor(score.grade)}`} />
        )}
      </div>

      {/* Accuracy */}
      <div className="mb-4">
        <span className={`text-5xl font-bold ${getGradeColor(score.grade)}`}>
          {score.accuracy}%
        </span>
        <p className="text-gray-600 mt-2">{getGradeMessage(score.grade)}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6 px-8">
        <Progress
          value={score.accuracy}
          variant={
            score.accuracy >= 90
              ? "success"
              : score.accuracy >= 70
              ? "default"
              : score.accuracy >= 50
              ? "warning"
              : "error"
          }
          size="lg"
        />
      </div>

      {/* XP earned */}
      <div className="bg-primary/10 rounded-lg py-3 px-6 inline-block mb-6">
        <span className="text-primary font-bold text-lg">+{score.xp} XP</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-gray-500 block">Word Error Rate</span>
          <span className="font-mono font-bold">
            {(score.wer * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-gray-500 block">Grade</span>
          <span className={`font-bold capitalize ${getGradeColor(score.grade)}`}>
            {score.grade}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onRetry}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        {onNext && (
          <Button onClick={onNext}>
            Next Exercise
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
}
```

### 7. Practice Page (45min)
```typescript
// src/app/(practice)/practice/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import { createClient } from "@/lib/supabase/server";
import { DictationSession } from "./dictation-session";

interface Props {
  params: { id: string };
}

export default async function PracticePage({ params }: Props) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load exercise
  const exercise = await getExerciseById(params.id).catch(() => null);
  if (!exercise) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <DictationSession
        exercise={exercise}
        userId={user.id}
      />
    </div>
  );
}
```

### 8. Dictation Session Client Component (50min)
```typescript
// src/app/(practice)/practice/[id]/dictation-session.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AudioPlayer } from "@/components/audio";
import { DictationInput } from "@/components/dictation/dictation-input";
import { DiffDisplay } from "@/components/dictation/diff-display";
import { ScoringPanel } from "@/components/dictation/scoring-panel";
import { useDictation } from "@/hooks/use-dictation";
import { Badge, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { Exercise } from "@/lib/queries/exercises";
import type { Score } from "@/lib/scoring";

interface Props {
  exercise: Exercise;
  userId: string;
}

export function DictationSession({ exercise, userId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const saveAttempt = async (score: Score, userText: string) => {
    setSaving(true);
    try {
      await supabase.from("attempts").insert({
        user_id: userId,
        content_id: exercise.id,
        user_text: userText,
        accuracy: score.accuracy,
        xp: score.xp,
      });

      // Update streak
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("streaks").upsert(
        {
          user_id: userId,
          date: today,
          exercises_count: 1,
        },
        {
          onConflict: "user_id,date",
          // Increment if exists
        }
      );
    } catch (err) {
      console.error("Failed to save attempt:", err);
    } finally {
      setSaving(false);
    }
  };

  const dictation = useDictation({
    transcript: exercise.transcript,
    onComplete: saveAttempt,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/exercises/${exercise.id}`}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Badge variant={exercise.level}>{exercise.level}</Badge>
      </div>

      <h1 className="text-2xl font-display font-bold">{exercise.title}</h1>

      {/* Audio Player */}
      <Card>
        <AudioPlayer audioUrl={exercise.audio_url} />
      </Card>

      {/* Instructions or Results */}
      {dictation.state === "idle" && (
        <Card>
          <h2 className="font-display font-semibold mb-2">Instructions</h2>
          <p className="text-gray-600 mb-4">
            Listen to the audio and type exactly what you hear. Use the playback
            controls to adjust speed or replay sections. When ready, click
            &quot;Check Answer&quot; to see your score.
          </p>
          <button
            onClick={dictation.start}
            className="text-primary font-medium hover:underline"
          >
            Start Dictation
          </button>
        </Card>
      )}

      {dictation.state === "practicing" && (
        <DictationInput
          value={dictation.userText}
          onChange={dictation.updateText}
          onSubmit={dictation.submit}
          placeholder={`Type the ${dictation.referenceWordCount} words you hear...`}
        />
      )}

      {dictation.state === "reviewing" && dictation.score && dictation.diffResult && (
        <>
          <ScoringPanel
            score={dictation.score}
            onRetry={dictation.retry}
            onNext={() => router.push("/exercises")}
          />
          <Card>
            <h3 className="font-display font-semibold mb-4">Your Answer</h3>
            <DiffDisplay
              diffResult={dictation.diffResult}
              referenceText={exercise.transcript}
            />
          </Card>
        </>
      )}

      {saving && (
        <p className="text-sm text-gray-500 text-center">Saving progress...</p>
      )}
    </div>
  );
}
```

### 9. Practice Layout (10min)
```typescript
// src/app/(practice)/layout.tsx
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
```

### 10. Export Index (5min)
```typescript
// src/components/dictation/index.ts
export { DictationInput } from "./dictation-input";
export { DiffDisplay } from "./diff-display";
export { ScoringPanel } from "./scoring-panel";
```

## Acceptance Criteria
- [ ] diff-match-patch computes word-level diffs
- [ ] WER calculated correctly (S+D+I)/N
- [ ] Dictation input auto-resizes, shows word count
- [ ] Ctrl+Enter submits answer
- [ ] Diff display shows matched/added/removed words
- [ ] Scoring panel shows accuracy, grade, XP
- [ ] Attempt saved to database
- [ ] Streak table updated on completion
- [ ] "Try Again" resets state
- [ ] "Next Exercise" navigates to browser

## Effort: 6h
