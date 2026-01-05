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
