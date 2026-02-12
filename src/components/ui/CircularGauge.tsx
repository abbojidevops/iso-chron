"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularGaugeProps {
    score: number; // 0 to 100
    size?: number;
}

export function CircularGauge({ score, size = 120 }: CircularGaugeProps) {
    const radius = size * 0.4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Color Logic
    const getColor = (s: number) => {
        if (s > 70) return "#4ade80"; // Green-400
        if (s > 40) return "#fbbf24"; // Amber-400
        return "#ef4444"; // Red-500
    };

    const color = getColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* Animated Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
                />
            </svg>

            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-white tracking-tighter">
                    {score}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    BIO-SAFE
                </span>
            </div>
        </div>
    );
}
