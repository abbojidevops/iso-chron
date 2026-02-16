"use client";

import * as React from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Info, Calendar as CalendarIcon, Droplets, Sparkles, AlertCircle } from "lucide-react";
import "react-day-picker/dist/style.css";

// Cycle Phase Constants
const PHASE_LENGTHS = {
    menstrual: 5,
    follicular: 9, // Days 6-14 (Total 14 days from start)
    ovulation: 1,  // Day 15
    luteal: 14     // Days 16-29
};

type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_INFO: Record<CyclePhase, { label: string; color: string; desc: string; icon: any }> = {
    menstrual: { label: "Menstrual Phase", color: "text-red-500", desc: "Hydration Focus. Avoid harsh actives.", icon: Droplets },
    follicular: { label: "Follicular Phase", color: "text-pink-500", desc: "Collagen Boost. Best time for new products.", icon: Sparkles },
    ovulation: { label: "Ovulation", color: "text-emerald-500", desc: "Peak Oiliness. Use Salicylic Acid.", icon: AlertCircle },
    luteal: { label: "Luteal Phase", color: "text-amber-500", desc: "Acne Prone. Anti-inflammatory focus.", icon: AlertCircle },
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
        menstrual: { color: '#f87171', fontWeight: 'bold' },
        follicular: { color: '#ec4899', fontWeight: 'bold' },
        ovulation: { color: '#10b981', fontWeight: 'bold' },
        luteal: { color: '#f59e0b', fontWeight: 'bold' }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {/* Calendar View */}
            <div className="p-6 rounded-3xl glass-card">
                <div className="flex items-center gap-3 mb-6">
                    <CalendarIcon className="w-5 h-5 text-neutral-400" />
                    <h2 className="text-lg font-semibold text-neutral-900">Biological Cycle</h2>
                </div>

                <div className="calendar-wrapper-light">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        month={selectedDate} // Auto navigate
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        styles={{
                            caption: { color: '#171717' }, // neutral-900
                            head_cell: { color: '#737373' }, // neutral-500
                            day: { color: '#404040' }, // neutral-700
                            nav_button: { color: '#525252' } // neutral-600
                        }}
                        className="rounded-xl border-none text-neutral-900 mx-auto"
                    />
                </div>

                <div className="mt-4 flex gap-4 text-[10px] uppercase font-mono text-neutral-500 justify-center">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Menstrual</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" /> Follicular</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Ovulation</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Luteal</div>
                </div>
            </div>

            {/* Phase Details Card */}
            <div className="relative overflow-hidden p-8 rounded-3xl glass-card flex flex-col justify-center border-neutral-200">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${phaseData.color.replace('text-', 'bg-')}/10 blur-[80px] rounded-full pointer-events-none transition-colors duration-700`} />

                <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-100 ${phaseData.color} text-xs font-bold uppercase tracking-wider mb-4 shadow-sm`}>
                        <phaseData.icon className="w-3 h-3" />
                        {phaseData.label}
                    </div>

                    <h3 className="text-3xl font-bold text-neutral-900 mb-2">
                        {selectedDate ? format(selectedDate, 'MMMM d') : 'Today'}
                    </h3>

                    <p className="text-neutral-500 text-lg leading-relaxed mb-8 font-medium">
                        {phaseData.desc}
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                            <div className="text-xs text-neutral-400 uppercase tracking-widest mb-2 font-semibold">Recommended Actives</div>
                            <div className="flex flex-wrap gap-2">
                                {currentPhase === 'luteal' && (
                                    <>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded border border-amber-200 font-medium">Salicylic Acid</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-200 font-medium">Niacinamide</span>
                                    </>
                                )}
                                {currentPhase === 'follicular' && (
                                    <>
                                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded border border-pink-200 font-medium">Vitamin C</span>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded border border-purple-200 font-medium">AHA/BHA</span>
                                    </>
                                )}
                                {currentPhase === 'menstrual' && (
                                    <>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-200 font-medium">Hyaluronic Acid</span>
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded border border-emerald-200 font-medium">Centella</span>
                                    </>
                                )}
                                {currentPhase === 'ovulation' && (
                                    <span className="px-2 py-1 bg-white text-neutral-700 text-xs rounded border border-neutral-200 font-medium">Oil-Free Moisturizer</span>
                                )}
                            </div>
                        </div>

                        {/* Setup Button if no cycle set */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button className="col-span-2 py-3 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/10">
                                Log Symptoms
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
