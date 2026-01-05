import Link from "next/link";
import { ArrowRight, Headphones, Target, Trophy, Flame } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const features = [
    {
      icon: Headphones,
      title: "Audio Dictation",
      description: "Practice listening with CEFR-leveled content and adjustable playback speed",
    },
    {
      icon: Target,
      title: "Instant Feedback",
      description: "See your accuracy score and word-by-word diff immediately",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Build streaks, earn XP, and unlock achievements as you improve",
    },
    {
      icon: Flame,
      title: "Daily Streaks",
      description: "Stay motivated with GitHub-style contribution graphs and streak tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-display font-bold text-gray-900 mb-6">
          Master English Listening
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Improve your English comprehension through daily dictation practice.
          Listen, type, and see your accuracy in real-time.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/exercises">
                <Button variant="secondary" size="lg">
                  Start Practicing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-display font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Choose Your Level", desc: "Select from A1 to C2 based on your proficiency" },
            { step: "2", title: "Listen & Type", desc: "Play the audio and type what you hear" },
            { step: "3", title: "Get Feedback", desc: "See your score and track your progress" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-display font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="bg-primary text-white">
          <h2 className="text-2xl font-display font-bold mb-4">
            Ready to improve your English?
          </h2>
          <p className="mb-6 opacity-80">
            Join thousands of learners practicing daily. Free forever.
          </p>
          <Link href={user ? "/exercises" : "/signup"}>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
              {user ? "Start Practicing" : "Create Free Account"}
            </Button>
          </Link>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Dictation Practice. Built for learners.</p>
        </div>
      </footer>
    </div>
  );
}
