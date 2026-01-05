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
