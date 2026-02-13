"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface SensitizationMeterProps {
    score: number; // 0-100 (0 = Safe, 100 = Severe Risk)
    riskLabel: string;
    flags: string[];
}

export function SensitizationMeter({ score, riskLabel, flags }: SensitizationMeterProps) {
    // Determine color based on score
    const getColor = (s: number) => {
        if (s < 30) return "text-green-400";
        if (s < 60) return "text-amber-400";
        return "text-red-500";
    };

    const colorClass = getColor(score);

    return (
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Sensitization Risk</h3>
                <div className={`p-2 rounded-full bg-white/5 ${colorClass}`}>
                    {score < 30 ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
            </div>

            {/* Meter Visual */}
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-4">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-20" />

                {/* Needle / Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500 relative"
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </motion.div>
            </div>

            {/* Stats */}
            <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
                <span className="text-neutral-500 text-sm">Target Probability</span>
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 bg-white/5 ${colorClass}`}>
                {riskLabel} Risk
            </div>

            {/* Flags */}
            {flags.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-neutral-500">Detected Haptens:</p>
                    <div className="flex flex-wrap gap-2">
                        {flags.map(flag => (
                            <span key={flag} className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase">
                                <AlertTriangle className="w-3 h-3" />
                                {flag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
