"use client";

import Link from "next/link";
import { FlaskConical, ShieldCheck, Zap, History, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: FlaskConical,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            title: "1. Select Ingredients",
            desc: "Begin by inputting your current skincare products. You can search our extensive molecular database or use the optical scanner to capture ingredients directly from product labels.",
            details: ["2000+ Ingredients Database", "Real-time OCR Scanning", "Fuzzy Search Matching"]
        },
        {
            icon: Zap,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            title: "2. Analyze Conflicts",
            desc: "Our engine simulates the chemical interaction between your selected compounds. It checks for pH incompatibilities, active ingredient clashes (e.g., Retinol vs. AHA), and stability issues.",
            details: ["pH Dependency Logic", "Concentration Analysis", "Stability Checks"]
        },
        {
            icon: ShieldCheck,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            title: "3. Verify Safety",
            desc: "Receive an instant 'Safety Score' (0-100%). A high score means your routine is bio-compatible. A low score indicates potential irritation or chemical burns. Follow the alerts to optimize.",
            details: ["Bio-Safety Score", "Irritation Prediction", "UV Sensitivity Alerts"]
        },
        {
            icon: History,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            title: "4. Save & Optimize",
            desc: "Once your routine is safe, archive it to your Molecular Vault. Use the Chrono-Sync feature to separate conflicting actives into AM and PM slots for maximum efficacy.",
            details: ["Molecular Vault Storage", "AM/PM Splitter Algorithm", "Routine History"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-12">
                    <Link href="/dashboard/new" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Command Center
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <FlaskConical className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ISO-CHRON Protocol</h1>
                    </div>
                    <p className="text-xl text-neutral-400 max-w-2xl">
                        Master your molecular skincare routine. Understand the science behind the simulation.
                    </p>
                </header>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative overflow-hidden rounded-3xl border ${step.border} ${step.bg} p-8 hover:bg-opacity-20 transition-all`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-6 md:items-start">
                                <div className={`p-4 rounded-2xl ${step.bg} ${step.border} border shrink-0`}>
                                    <step.icon className={`w-8 h-8 ${step.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-neutral-300 leading-relaxed mb-6 text-lg">{step.desc}</p>

                                    <div className="flex flex-wrap gap-3">
                                        {step.details.map((detail, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/5 text-xs font-mono text-neutral-400 uppercase tracking-wider">
                                                <CheckCircle2 className="w-3 h-3" />
                                                {detail}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <Link href="/dashboard/new">
                        <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Initiate Molecular Scan
                        </button>
                    </Link>
                    <p className="mt-4 text-sm text-neutral-500 font-mono">SYSTEM READY // v2.1</p>
                </div>
            </div>
        </div>
    );
}
