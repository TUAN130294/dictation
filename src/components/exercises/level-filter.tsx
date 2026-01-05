"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CEFRLevel } from "@/lib/queries/exercises";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function LevelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLevel = searchParams.get("level") as CEFRLevel | null;

  const handleLevelChange = (level: CEFRLevel | null) => {
    const params = new URLSearchParams(searchParams);
    if (level) {
      params.set("level", level);
    } else {
      params.delete("level");
    }
    router.push(`/exercises?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleLevelChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !currentLevel
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {LEVELS.map((level) => (
        <button
          key={level}
          onClick={() => handleLevelChange(level)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentLevel === level
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
