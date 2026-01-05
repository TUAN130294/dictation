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
