"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function ChronoSyncTimeline() {
    // Mock Data for now until DB integration
    const [schedule, setSchedule] = useState({
        am: ["Vitamin C Serum", "SPF 50"],
        pm: ["Retinol 0.5%", "Peptide Cream", "Hylauronic Acid"]
    });

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header / Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-blue-400 animate-ping' : 'bg-green-500'}`} />
                        <div className={`absolute inset-0 w-3 h-3 rounded-full ${isSyncing ? 'bg-blue-400' : 'bg-green-500'} opacity-50 blur-sm`} />
                    </div>
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                        {isSyncing ? 'SYNCING...' : 'LIVE SYNC ACTIVE'}
                    </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span className="text-xs text-neutral-300 font-mono">Next Step: 08:00 PM</span>
                </div>
            </div>

            {/* Timelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AM Sequence */}
                <div className="group relative p-6 rounded-3xl bg-neutral-900/50 border border-t-[var(--card-border)] border-[rgba(255,255,255,0.05)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                                <Sun className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Morning Sequence</h3>
                        </div>
                        <span className="text-xs text-neutral-500">07:00 - 09:00</span>
                    </div>

                    <div className="space-y-3 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10" />

                        {schedule.am.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative flex items-center gap-4 pl-2 z-10"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-mono text-neutral-500">{i + 1}</span>
                                </div>
                                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors flex items-center justify-between group/item cursor-grab active:cursor-grabbing">
                                    <span className="text-sm text-neutral-200">{item}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 opacity-0 group-hover/item:opacity-100" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* PM Sequence */}
                <div className="group relative p-6 rounded-3xl bg-neutral-900/50 border border-t-[var(--card-border)] border-[rgba(255,255,255,0.05)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                <Moon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Evening Sequence</h3>
                        </div>
                        <span className="text-xs text-neutral-500">20:00 - 22:00</span>
                    </div>

                    <div className="space-y-3 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10" />

                        {schedule.pm.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative flex items-center gap-4 pl-2 z-10"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-mono text-neutral-500">{i + 1}</span>
                                </div>
                                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors flex items-center justify-between group/item cursor-grab active:cursor-grabbing">
                                    <span className="text-sm text-neutral-200">{item}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 opacity-0 group-hover/item:opacity-100" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sync Action */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSync}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSyncing ? 'Syncing...' : 'Save Sequence'}
                </button>
            </div>
        </div>
    );
}
