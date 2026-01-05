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
