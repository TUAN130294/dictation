import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getExerciseById, getUserAttempts } from "@/lib/queries/exercises";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge, Card } from "@/components/ui";
import { formatTime } from "@/lib/audio-utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDetailPage({ params }: Props) {
  const { id } = await params;
  const exercise = await getExerciseById(id).catch(() => null);
  if (!exercise) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const attempts = user ? await getUserAttempts(user.id, exercise.id) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/exercises"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to exercises
      </Link>

      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <Badge variant={exercise.level} className="text-sm">
            {exercise.level}
          </Badge>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTime(exercise.duration)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold mb-4">{exercise.title}</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Listen to the audio and type what you hear. You can replay as many times
          as needed, adjust the speed, and see your accuracy score when done.
        </p>

        <Link href={`/practice/${exercise.id}`}>
          <Button size="lg" className="w-full sm:w-auto">
            Start Dictation
          </Button>
        </Link>
      </Card>

      {/* Previous attempts */}
      {attempts.length > 0 && (
        <Card>
          <h2 className="font-display font-semibold mb-4">Your Attempts</h2>
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-500">
                  {new Date(attempt.created_at).toLocaleDateString()}
                </span>
                <span className={`font-medium ${
                  attempt.accuracy >= 90 ? "text-success" :
                  attempt.accuracy >= 70 ? "text-warning" : "text-error"
                }`}>
                  {attempt.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
