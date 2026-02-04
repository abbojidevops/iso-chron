"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const SerumBottle = dynamic(() => import("@/components/canvas/SerumBottle"), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-background overflow-hidden relative">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-white/10 bg-black/20 backdrop-blur-md pb-6 pt-8 text-neutral-400 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-neutral-900/30 lg:p-4">
          ISO-CHRON &nbsp;
          <code className="font-mono font-bold text-neutral-100">v1.2.0</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black/80 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 text-white"
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            By <span className="font-bold">Antigravity</span>
          </a>
        </div>
      </div>

      <div className="relative flex flex-col place-items-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20 tracking-tighter mb-6 relative">
            ISO-CHRON
            <Sparkles className="absolute -top-8 -right-8 w-12 h-12 text-blue-400 animate-pulse opacity-50" />
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-10">
            The Molecular Audit Platform for Skincare Logic.
          </p>

          <Link href="/dashboard">
            <button className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2 mx-auto">
              Start Molecular Audit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none lg:pointer-events-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px]">
          <SerumBottle />
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left z-20 gap-4 mt-20">
        {[
          { title: "Analysis", desc: "Deep chemical conflict detection between products." },
          { title: "Glassmorphism", desc: "Premium UI designed for the 2026 aesthetic." },
          { title: "Supabase", desc: "Secure ingredient database functionality." },
          { title: "Three.js", desc: "Interactive 3D molecular visualization." }
        ].map((item, i) => (
          <div key={i} className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30">
            <h2 className={`mb-3 text-2xl font-semibold`}>
              {item.title}{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
