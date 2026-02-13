"use client";

import * as React from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils"; // Ensure this utils file exists or substitute
import { motion } from "framer-motion";
import { Info, Calendar as CalendarIcon, Droplets, Sparkles, AlertCircle } from "lucide-react";
import "react-day-picker/dist/style.css"; // We might need to adjust styles for "Deep Obsidian"

// Cycle Phase Constants
const PHASE_LENGTHS = {
    menstrual: 5,
    follicular: 9, // Days 6-14 (Total 14 days from start)
    ovulation: 1,  // Day 15
    luteal: 14     // Days 16-29
};

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_INFO: Record<CyclePhase, { label: string; color: string; desc: string; icon: any }> = {
    menstrual: { label: "Menstrual Phase", color: "text-red-400", desc: "Hydration Focus. Avoid harsh actives.", icon: Droplets },
    follicular: { label: "Follicular Phase", color: "text-pink-400", desc: "Collagen Boost. Best time for new products.", icon: Sparkles },
    ovulation: { label: "Ovulation", color: "text-green-400", desc: "Peak Oiliness. Use Salicylic Acid.", icon: AlertCircle },
    luteal: { label: "Luteal Phase", color: "text-amber-400", desc: "Acne Prone. Anti-inflammatory focus.", icon: AlertCircle },
};

export function HormonalCalendar() {
    const [cycleStart, setCycleStart] = React.useState<Date | undefined>(new Date(2023, 9, 1)); // Default Oct 1, 2023 for demo
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

    // Calculate current phase based on diff from cycleStart
    const getPhase = (date: Date): CyclePhase => {
        if (!cycleStart) return 'follicular';
        const diff = differenceInDays(date, cycleStart) % 29; // Assuming 29 day cycle
        const day = diff < 0 ? 29 + diff : diff + 1; // 1-indexed day of cycle

        if (day <= PHASE_LENGTHS.menstrual) return 'menstrual';
        if (day <= PHASE_LENGTHS.menstrual + PHASE_LENGTHS.follicular) return 'follicular';
        if (day <= PHASE_LENGTHS.menstrual + PHASE_LENGTHS.follicular + PHASE_LENGTHS.ovulation) return 'ovulation';
        return 'luteal';
    };

    const currentPhase = selectedDate ? getPhase(selectedDate) : 'follicular';
    const phaseData = PHASE_INFO[currentPhase];

    // Custom Day Render for phase dots
    const modifiers = {
        menstrual: (date: Date) => getPhase(date) === 'menstrual',
        follicular: (date: Date) => getPhase(date) === 'follicular',
        ovulation: (date: Date) => getPhase(date) === 'ovulation',
        luteal: (date: Date) => getPhase(date) === 'luteal',
    };

    const modifiersStyles = {
        menstrual: { color: '#f87171' }, // Red-400
        follicular: { color: '#f472b6' }, // Pink-400
        ovulation: { color: '#4ade80' }, // Green-400
        luteal: { color: '#fbbf24' } // Amber-400
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {/* Calendar View */}
            <div className="p-6 rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <CalendarIcon className="w-5 h-5 text-neutral-400" />
                    <h2 className="text-lg font-semibold text-white">Biological Cycle</h2>
                </div>

                <div className="calendar-wrapper-dark">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={selectedDate} // Auto navigate
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        styles={{
                            caption: { color: 'white' },
                            head_cell: { color: '#a3a3a3' },
                            day: { color: 'white' },
                            nav_button: { color: 'white' }
                        }}
                        className="rounded-xl border-none text-white mx-auto"
                    />
                </div>

                <div className="mt-4 flex gap-4 text-[10px] uppercase font-mono text-neutral-500 justify-center">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Menstrual</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" /> Follicular</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Ovulation</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Luteal</div>
                </div>
            </div>

            {/* Phase Details Card */}
            <div className="relative overflow-hidden p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col justify-center">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${phaseData.color.replace('text-', 'bg-')}/10 blur-[80px] rounded-full pointer-events-none transition-colors duration-700`} />

                <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${phaseData.color} text-xs font-bold uppercase tracking-wider mb-4`}>
                        <phaseData.icon className="w-3 h-3" />
                        {phaseData.label}
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-2">
                        {selectedDate ? format(selectedDate, 'MMMM d') : 'Today'}
                    </h3>

                    <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                        {phaseData.desc}
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Recommended Actives</div>
                            <div className="flex flex-wrap gap-2">
                                {currentPhase === 'luteal' && (
                                    <>
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20">Salicylic Acid</span>
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">Niacinamide</span>
                                    </>
                                )}
                                {currentPhase === 'follicular' && (
                                    <>
                                        <span className="px-2 py-1 bg-pink-500/10 text-pink-400 text-xs rounded border border-pink-500/20">Vitamin C</span>
                                        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20">AHA/BHA</span>
                                    </>
                                )}
                                {currentPhase === 'menstrual' && (
                                    <>
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">Hyaluronic Acid</span>
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Centella</span>
                                    </>
                                )}
                                {currentPhase === 'ovulation' && (
                                    <span className="px-2 py-1 bg-white/10 text-white text-xs rounded border border-white/20">Oil-Free Moisturizer</span>
                                )}
                            </div>
                        </div>

                        {/* Setup Button if no cycle set */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button className="col-span-2 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
                                Log Symptoms
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
