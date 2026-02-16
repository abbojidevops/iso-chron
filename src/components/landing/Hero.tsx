"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Dna, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container px-4 mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/20 text-sm text-blue-600 font-medium">
                        <Sparkles className="w-4 h-4" />
                        <span>The Future of Skincare Logic</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                        Unlock the Science of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Skin</span>
                    </h1>

                    <p className="text-xl text-neutral-600 max-w-lg leading-relaxed">
                        Revolutionary skincare diagnostics powered by molecular science and artificial intelligence. Reveal what's happening beneath the surface.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link href="/dashboard">
                            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
                                Get Your Audit
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <button className="px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 rounded-full font-bold text-lg transition-all border border-neutral-200 shadow-sm">
                            Explore the Science
                        </button>
                    </div>
                </motion.div>

                {/* Right: Visuals (Abstract Molecular Art) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative h-[600px] w-full hidden lg:block"
                >
                    {/* Glass Card 1 */}
                    <div className="absolute top-10 right-10 w-72 p-6 glass-card rounded-3xl z-20 animate-float-slow">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                            <Dna className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Personalized Precision</h3>
                        <p className="text-sm text-neutral-500">Experience skincare powered by advanced molecular diagnostics.</p>
                    </div>

                    {/* Glass Card 2 */}
                    <div className="absolute bottom-20 left-10 w-72 p-6 glass-card rounded-3xl z-30 animate-float-delayed">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                            <FlaskConical className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Beyond Surface Analysis</h3>
                        <p className="text-sm text-neutral-500">Transform your skin health with data-driven insights.</p>
                    </div>

                    {/* Central Image Placeholder (Simulating the bottle/DNA art) */}
                    <div className="absolute inset-x-20 inset-y-10 rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-b from-blue-500/10 to-purple-500/10 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="relative w-full h-full bg-[url('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop')] bg-cover bg-center opacity-80 mix-blend-overlay"></div>
                        {/* Using a generic scientific abstract background URL or CSS pattern if valid URLs aren't available - using CSS pattern for safety in next step if this fails, but attempting a placeholder div */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
