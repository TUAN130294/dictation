import { notFound, redirect } from "next/navigation";
import { getExerciseById } from "@/lib/queries/exercises";
import { createClient } from "@/lib/supabase/server";
import { DictationSession } from "./dictation-session";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load exercise
  const exercise = await getExerciseById(id).catch(() => null);
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
