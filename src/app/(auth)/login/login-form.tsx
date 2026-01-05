"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-error text-sm">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:brightness-95 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-12 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50"
      >
        Continue with Google
      </button>
    </form>
  );
}
