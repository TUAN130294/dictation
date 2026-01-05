import type { Metadata, Viewport } from "next";
import { Inter, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dictation Practice - Master English Listening",
    template: "%s | Dictation Practice",
  },
  description: "Improve your English listening skills with daily dictation exercises. Practice with CEFR-leveled content, track your progress, and earn achievements.",
  keywords: ["english", "dictation", "listening", "practice", "CEFR", "learning"],
  authors: [{ name: "Dictation Practice" }],
  openGraph: {
    type: "website",
    title: "Dictation Practice",
    description: "Master English listening with daily dictation practice",
    siteName: "Dictation Practice",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A56DB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
