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
        if (s < 30) return "text-cyan-600 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"; // Bioluminescent Blue
        if (s < 60) return "text-amber-600 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"; // Amber Glow
        return "text-red-600 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]"; // Neon Red
    };

    const colorClass = getColor(score);

    // Gradient for the bar (Vivid)
    const gradientClass = `bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500`;

    return (
        <div className="p-6 rounded-3xl glass-card relative overflow-hidden group">
            {/* Ambient Background Glow based on risk */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-10 ${score < 30 ? 'bg-cyan-500' : (score < 60 ? 'bg-amber-500' : 'bg-red-500')
                }`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    Irritation Risk
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3 h-3 text-neutral-400 hover:text-neutral-600 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="w-[200px] text-xs">Derived from molecular weight, lipophilicity, and protein-binding potential.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </h3>
                <div className={`p-2 rounded-full bg-white border border-neutral-100 shadow-sm ${colorClass}`}>
                    {score < 30 ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
            </div>

            {/* Meter Visual */}
            <div className="relative h-4 bg-neutral-100 rounded-full overflow-hidden mb-4 border border-neutral-200">
                {/* Needle / Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${gradientClass} relative shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white shadow-sm" />
                </motion.div>
            </div>

            {/* Stats */}
            <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
                <span className="text-neutral-500 text-sm">Sensitivity Probability</span>
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 bg-white border border-neutral-100 shadow-sm ${colorClass}`}>
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
                                        <span className="cursor-help flex items-center gap-1 px-2 py-1 rounded bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase hover:bg-red-100 transition-colors">
                                            <AlertTriangle className="w-3 h-3" />
                                            {flag.name}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-white border-red-100 text-neutral-800 text-xs max-w-[250px] shadow-lg">
                                        <p><span className="font-bold text-red-500">Scientific Basis:</span> {flag.basis}</p>
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
