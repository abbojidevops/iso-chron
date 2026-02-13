"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming we have shadcn tooltip or I'll implement a simple one

interface SensitizationMeterProps {
    score: number; // 0-100
    riskLabel: string;
    flags: Array<{ name: string; basis: string }>;
}

export function SensitizationMeter({ score, riskLabel, flags }: SensitizationMeterProps) {
    // Bioluminescent Gradient Logic
    // Blue (Safe) -> Amber (Caution) -> Neon Red (Danger)
    const getColor = (s: number) => {
        if (s < 30) return "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"; // Bioluminescent Blue
        if (s < 60) return "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"; // Amber Glow
        return "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1.0)]"; // Neon Red
    };

    const colorClass = getColor(score);

    // Gradient for the bar
    const gradientClass = `bg-gradient-to-r from-cyan-500 via-amber-500 to-red-600`;

    return (
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden group">
            {/* Ambient Background Glow based on risk */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 ${score < 30 ? 'bg-cyan-500' : (score < 60 ? 'bg-amber-500' : 'bg-red-500')
                }`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    Irritation Risk
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3 h-3 text-neutral-600 hover:text-white transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="w-[200px] text-xs">Derived from molecular weight, lipophilicity, and protein-binding potential.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </h3>
                <div className={`p-2 rounded-full bg-white/5 ${colorClass}`}>
                    {score < 30 ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
            </div>

            {/* Meter Visual */}
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                {/* Needle / Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${gradientClass} relative shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                </motion.div>
            </div>

            {/* Stats */}
            <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
                <span className="text-neutral-500 text-sm">Sensitivity Probability</span>
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 bg-white/5 border border-white/10 ${colorClass}`}>
                {riskLabel} Risk
            </div>

            {/* Flags with Scientific Basis Tooltips */}
            {flags.length > 0 && (
                <div className="space-y-2 relative z-10">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Molecular Alerts:</p>
                    <div className="flex flex-wrap gap-2">
                        <TooltipProvider>
                            {flags.map((flag, idx) => (
                                <Tooltip key={`${flag.name}-${idx}`}>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-help flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase hover:bg-red-500/20 transition-colors">
                                            <AlertTriangle className="w-3 h-3" />
                                            {flag.name}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-neutral-900 border-red-500/30 text-xs max-w-[250px]">
                                        <p><span className="font-bold text-red-400">Scientific Basis:</span> {flag.basis}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </div>
                </div>
            )}
        </div>
    );
}
