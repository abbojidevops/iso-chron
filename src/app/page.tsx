"use client";

import { Hero } from "@/components/landing/Hero";
import { Science } from "@/components/landing/Science";
import { Features } from "@/components/landing/Features";
import { Team } from "@/components/landing/Team";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Navigation Placeholder (Floating) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm">
          <div className="font-bold text-xl tracking-tight text-neutral-900 pl-4">ISO-CHRON</div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors">
              Launch App
            </a>
          </div>
        </div>
      </header>

      <Hero />
      <Science />
      <Features />
      <Team />

      <footer className="py-12 bg-neutral-50 border-t border-neutral-100 text-center text-sm text-neutral-400">
        <p>© 2026 ISO-CHRON Molecular Labs. All rights reserved.</p>
      </footer>
    </main>
  );
}
