import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Exercise = Tables<"content">;

export async function getExercises(level?: CEFRLevel): Promise<Exercise[]> {
  const supabase = await createClient();

  let query = supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false });

  if (level) {
    query = query.eq("level", level);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Exercise[];
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch exercise: ${error.message}`);
  }

  if (!data) {
    throw new Error("Exercise not found");
  }

  return data;
}

export async function getUserAttempts(userId: string, contentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}
