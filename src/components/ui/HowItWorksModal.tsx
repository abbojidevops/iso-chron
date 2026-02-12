"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlaskConical, ShieldCheck, Zap, History, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorksModal() {
    const steps = [
        {
            icon: FlaskConical,
            color: "text-blue-400",
            title: "Select Ingredients",
            desc: "Search database or scan your product label to build your routine."
        },
        {
            icon: Zap,
            color: "text-amber-400",
            title: "Analyze Conflicts",
            desc: "Our engine checks for pH incompatibilities and hazardous mixtures."
        },
        {
            icon: ShieldCheck,
            color: "text-green-400",
            title: "Verify Safety",
            desc: "Get a real-time 'Safety Score' and visual feedback on your mix."
        },
        {
            icon: History,
            color: "text-purple-400",
            title: "Save & Optimize",
            desc: "Archive your routine to the Vault and get Chrono-Sync (AM/PM) advice."
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-400 rounded-xl hover:bg-white/5 hover:text-white transition-all w-full">
                    <HelpCircle className="w-5 h-5" />
                    <span>How it Works</span>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 text-white rounded-3xl shadow-2xl p-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

                <div className="p-8 relative z-10">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-bold tracking-tighter flex items-center gap-3">
                            <FlaskConical className="w-8 h-8 text-blue-500" />
                            ISO-CHRON Protocol
                        </DialogTitle>
                        <p className="text-neutral-400 mt-2">Master your molecular skincare routine in 4 steps.</p>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors"
                            >
                                <div className={`p-2 rounded-lg bg-white/5 ${step.color} border border-white/5 shrink-0`}>
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">{step.title}</h4>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest self-center mr-auto">System v1.0.4</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
