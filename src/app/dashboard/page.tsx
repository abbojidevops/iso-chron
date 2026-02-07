"use client";

import { useState, Suspense } from "react";
import { UserButton, SignInButton, SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import { INGREDIENTS } from "@/lib/ingredients";
import { runMolecularAudit } from "@/lib/conflict-engine"; // New Engine
import { runChronoSplit, getIngredientName } from "@/lib/chrono-splitter"; // Chrono Logic
import { cn } from "@/lib/utils";
import { AlertTriangle, X, FlaskConical, ShieldCheck, Lock, CheckCircle, Flame, Zap, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

import { useSearchParams } from "next/navigation";

function DashboardContent() {
    const { session } = useSession();
    const { isSignedIn, user } = useUser();
    const searchParams = useSearchParams();
    const isPremium = searchParams.get('success') === 'true'; // Basic gating for demo

    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

    // Derived state from the new engine
    const { finalScore, conflicts, status } = runMolecularAudit(selectedIngredients);

    const toggleIngredient = (id: string) => {
        let next: string[];
        if (selectedIngredients.includes(id)) {
            next = selectedIngredients.filter((i) => i !== id);
        } else {
            next = [...selectedIngredients, id];
        }
        setSelectedIngredients(next);
    };

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!isSignedIn) return;

        setSaving(true);
        try {
            const token = await session?.getToken({ template: 'supabase' });

            if (!token) {
                console.warn("No Supabase token found.");
                throw new Error("Missing Supabase JWT Template in Clerk.");
            }

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const supabase = createClient(supabaseUrl, supabaseKey, {
                global: { headers: { Authorization: `Bearer ${token}` } },
            });

            const { error } = await supabase.from('user_products').insert({
                user_id: user.id,
                product_name: `Routine Analysis - Score ${finalScore}`, // Dynamic name
                ingredient_ids: selectedIngredients
            });

            if (error) throw error;

            alert("Routine saved successfully to your Skin Dossier!");

        } catch (e) {
            console.error(e);
            const msg = (e as Error).message;
            if (msg.includes("JWT")) {
                alert("Setup Required: Please add the 'supabase' JWT Template in your Clerk Dashboard.");
            } else {
                alert("Error saving routine: " + msg);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 text-foreground pb-20">
            <header className="mb-12 flex items-center justify-between mx-auto max-w-6xl">
                <div className="flex items-center gap-3">
                    <FlaskConical className="w-8 h-8 text-blue-500" />
                    <h1 className="text-3xl font-bold tracking-tight">Bio-Audit</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-mono border border-blue-500/30">
                        ISO-CHRON v1.0
                    </div>

                    <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-3">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-neutral-200 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <span className="text-sm text-neutral-400 mr-2 hidden sm:inline">
                                {user?.firstName || user?.username}
                            </span>
                            <UserButton afterSignOutUrl="/" appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 border-2 border-white/10"
                                }
                            }} />
                        </SignedIn>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Ingredient Selector */}
                <div className="md:col-span-7 bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        Available Compounds
                        <span className="text-xs text-neutral-500 font-normal ml-auto">Select to mix</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {INGREDIENTS.map((ing) => {
                            const active = selectedIngredients.includes(ing.id);
                            return (
                                <button
                                    key={ing.id}
                                    onClick={() => toggleIngredient(ing.id)}
                                    className={cn(
                                        "relative p-4 rounded-xl text-left transition-all duration-300 border",
                                        active
                                            ? "bg-blue-500/20 border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                            : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/20"
                                    )}
                                >
                                    <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">{ing.category}</span>
                                    <span className="font-medium">{ing.name}</span>
                                    {active && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* NEW Molecular Visualizer Component */}
                <div className={cn(
                    "md:col-span-5 bg-card/60 backdrop-blur-xl border shadow-xl rounded-3xl p-8 transition-colors duration-500 flex flex-col relative overflow-hidden",
                    status === 'Hazardous' ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]' :
                        status === 'Caution' ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
                            'border-blue-500/20 bg-black/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                )}>
                    {status === 'Hazardous' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}

                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 z-10">
                        Molecular Analysis
                        {status === 'Optimal' && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {status === 'Hazardous' && <Flame className="w-5 h-5 text-red-500 animate-pulse" />}
                        {status === 'Caution' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    </h2>

                    {/* Safety Score Bar */}
                    <div className="relative z-10 mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-mono opacity-70">SAFETY SCORE</span>
                            <span className={cn("text-2xl font-bold font-mono",
                                finalScore > 70 ? "text-green-400" : finalScore > 40 ? "text-amber-400" : "text-red-500"
                            )}>
                                {finalScore}/100
                            </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className={cn("h-full",
                                    finalScore > 70 ? "bg-green-500 shadow-[0_0_10px_#22c55e]" :
                                        finalScore > 40 ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" :
                                            "bg-red-500 shadow-[0_0_10px_#ef4444]"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${finalScore}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 z-10 min-h-[160px]">
                        <AnimatePresence mode="popLayout">
                            {conflicts.length === 0 && selectedIngredients.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center text-neutral-500 space-y-4 pt-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="text-sm">Synergy Optimal. No reactive compounds detected.</p>
                                </motion.div>
                            )}

                            {selectedIngredients.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center text-neutral-600"
                                >
                                    <FlaskConical className="w-8 h-8 mb-3 opacity-20" />
                                    <p>Select ingredients to begin digital scan...</p>
                                </motion.div>
                            )}

                            {conflicts.map((conflict, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn("p-4 rounded-xl border relative overflow-hidden",
                                        conflict.severity === 'Critical' ? "bg-red-950/40 border-red-500/50" :
                                            conflict.severity === 'High' ? "bg-red-900/20 border-red-500/30" :
                                                "bg-amber-900/10 border-amber-500/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-80"
                                            style={{ color: conflict.severity === 'Low' ? '#fbbf24' : '#f87171' }}>
                                            <Zap className="w-3 h-3" />
                                            {conflict.type}
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/90 leading-relaxed font-light">
                                        {conflict.message}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* NEW: Chrono-Splitter Timeline (Premium Feature) */}
                    <div className="mt-8 pt-6 border-t border-white/5 z-10 relative">
                        <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            Routine Timeline
                            {!isPremium && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">PREMIUM</span>}
                        </h3>

                        <div className={cn("grid grid-cols-2 gap-4 transition-all duration-500", !isPremium && "blur-sm opacity-50 grayscale")}>
                            {/* AM Routine */}
                            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3 text-orange-300">
                                    <Sun className="w-5 h-5" />
                                    <span className="font-bold">Morning (AM)</span>
                                </div>
                                <div className="space-y-2">
                                    {runChronoSplit(selectedIngredients).am.length > 0 ? (
                                        runChronoSplit(selectedIngredients).am.map(id => (
                                            <div key={id} className="text-sm bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/10 text-orange-100 flex items-center justify-between">
                                                <span>{getIngredientName(id)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-neutral-500 italic">No AM actives selected</p>
                                    )}
                                </div>
                            </div>

                            {/* PM Routine */}
                            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3 text-indigo-300">
                                    <Moon className="w-5 h-5" />
                                    <span className="font-bold">Evening (PM)</span>
                                </div>
                                <div className="space-y-2">
                                    {runChronoSplit(selectedIngredients).pm.length > 0 ? (
                                        runChronoSplit(selectedIngredients).pm.map(id => (
                                            <div key={id} className="text-sm bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10 text-indigo-100 flex items-center justify-between">
                                                <span>{getIngredientName(id)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-neutral-500 italic">No PM actives selected</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lock Overlay */}
                        {!isPremium && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center shadow-2xl">
                                    <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-white mb-1">Premium Feature</h4>
                                    <p className="text-sm text-neutral-400 mb-4 max-w-[200px] mx-auto">
                                        Unlock the Chrono-Splitter to optimize your AM/PM routine.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 z-10">
                        <div className="flex justify-between items-center text-xl font-bold text-white mt-1">
                            <span>Total</span>
                            <span className="text-white">$45.00</span>
                        </div>

                        {isSignedIn ? (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/checkout', { method: 'POST' });

                                        if (!res.ok) {
                                            const errData = await res.json();
                                            throw new Error(errData.error || "Checkout request failed");
                                        }

                                        const data = await res.json();
                                        if (data.url) window.location.href = data.url;
                                    } catch (e: any) {
                                        alert(`Checkout Error: ${e.message}`);
                                    }
                                }}
                                className={cn("w-full mt-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group bg-white hover:bg-neutral-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]")}
                            >
                                <span>Purchase Premium Audit</span>
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <span>Sign In to Save</span>
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Bio-Audit...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
