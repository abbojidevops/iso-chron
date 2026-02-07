"use client";

import { useState, Suspense, useEffect } from "react";
import { UserButton, SignInButton, SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import { INGREDIENTS, Ingredient } from "@/lib/ingredients";
import { runMolecularAudit } from "@/lib/conflict-engine"; // New Engine
import { runChronoSplit, getIngredientName } from "@/lib/chrono-splitter"; // Chrono Logic
import { getLocalUVIndex, isSunSafe } from "@/lib/uv-api"; // UV Logic
import { cn } from "@/lib/utils";
import { AlertTriangle, X, FlaskConical, ShieldCheck, Lock, CheckCircle, Flame, Zap, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { MolecularVisualizer } from "@/components/canvas/MolecularVisualizer";
import { OCRScanner } from "@/components/ocr/OCRScanner";
import { AIChat } from "@/components/chat/AIChat";

import { useSearchParams } from "next/navigation";
declare global {
    interface Window {
        Clerk?: any;
    }
}

function DashboardContent() {
    const { session } = useSession();
    const { isSignedIn, user } = useUser();
    const searchParams = useSearchParams();

    const [ingredients, setIngredients] = useState<Ingredient[]>([]); // DB Ingredients
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [uvAlert, setUvAlert] = useState<string | null>(null);
    const [uvData, setUvData] = useState<number | null>(null);

    // Fetch Ingredients on Mount
    useEffect(() => {
        const loadIngredients = async () => {
            // Fallback to local until DB fetch succeeds
            setIngredients(INGREDIENTS);

            try {
                const { fetchIngredients } = await import("@/lib/api");
                const dbIngredients = await fetchIngredients();
                if (dbIngredients.length > 0) {
                    setIngredients(dbIngredients);
                }
            } catch (e) {
                console.error("Failed to load ingredients from DB", e);
            }
        };
        loadIngredients();
    }, []);

    // Fetch UV Index on Mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const uv = await getLocalUVIndex(latitude, longitude);
                if (uv !== null) {
                    setUvData(uv);
                }
            });
        }
    }, []);

    // Re-run UV check when ingredients or UV index changes
    useEffect(() => {
        if (uvData !== null) {
            const { safe, reason } = isSunSafe(uvData, selectedIngredients);
            setUvAlert(safe ? null : reason || null);
        }
    }, [uvData, selectedIngredients]);

    // Check Premium Status on Mount
    useEffect(() => {
        const checkPremium = async () => {
            if (!user) return;

            // 1. Check URL query param (Optimistic UI for immediate feedback after redirect)
            if (searchParams.get('success') === 'true') {
                setIsPremium(true);
            }

            // 2. Check Database (Persistent Source of Truth)
            try {
                const session = await window.Clerk?.session;
                const token = await session?.getToken({ template: 'supabase' });

                if (!token) return;

                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    { global: { headers: { Authorization: `Bearer ${token}` } } }
                );

                const { data } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('user_id', user.id)
                    .single();

                if (data?.is_premium) {
                    setIsPremium(true);
                }
            } catch (err) {
                console.error("Error checking premium status:", err);
            }
        };

        checkPremium();
    }, [user, searchParams]);

    // History State
    const [history, setHistory] = useState<any[]>([]);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const session = await window.Clerk?.session;
            const token = await session?.getToken({ template: 'supabase' });
            if (!token) return;

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            );

            const { data } = await supabase
                .from('user_products')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setHistory(data);
        } catch (e) {
            console.error("History fetch error:", e);
        }
    };

    // Fetch History on Mount
    useEffect(() => {
        if (isSignedIn) fetchHistory();
    }, [isSignedIn, user]);

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
                product_name: `Routine Analysis - ${new Date().toLocaleTimeString()}`,
                ingredient_ids: selectedIngredients,
                score: finalScore,
                status: status
            });

            // Refresh history after save
            await fetchHistory();

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

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            Available Compounds
                        </h2>
                        <div className="flex gap-2">
                            <OCRScanner onScanComplete={(found) => {
                                const merged = Array.from(new Set([...selectedIngredients, ...found]));
                                setSelectedIngredients(merged);
                            }} />
                            <span className="text-xs text-neutral-500 font-normal py-2">Select to mix</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {ingredients.map((ing) => {
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
                            );
                        })}
                    </div>
                </div>

                {/* Analysis Card */}
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

                            {selectedIngredients.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="relative w-full h-[400px] rounded-xl overflow-hidden mb-4 border border-white/10 shadow-inner"
                                >
                                    <MolecularVisualizer
                                        ingredients={ingredients.filter(i => selectedIngredients.includes(i.id))}
                                        conflicts={conflicts}
                                        status={status}
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                                </motion.div>
                            )}

                            {conflicts.map((conflict, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn("p-4 rounded-xl border relative overflow-hidden group hover:bg-white/5 transition-colors",
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

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-scanline" />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                    </div>

                    {/* NEW: UV Index Alert */}
                    {uvAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-orange-500/10 border border-orange-500/50 rounded-xl flex items-start gap-3 relative overflow-hidden"
                        >
                            <div className="p-2 bg-orange-500/20 rounded-lg shrink-0">
                                <Sun className="w-6 h-6 text-orange-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-200 text-sm uppercase tracking-wider mb-1">
                                    UV Correlation Alert
                                </h3>
                                <p className="text-sm text-orange-100/80">
                                    {uvAlert}
                                </p>
                            </div>
                        </motion.div>
                    )}

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

                {/* Routine History (Right Column on Mobile, or Bottom) */}
                <div className="md:col-span-12 lg:col-span-5 space-y-4">
                    {/* We can put history here if we want a 3-col layout or just below */}
                </div>

            </div>

            {/* Routine History Section - Full Width below main interaction area */}
            <div className="max-w-6xl mx-auto mt-12">
                <h3 className="text-xl font-light text-white/90 flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Skin Dossier (History)
                </h3>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {history.length === 0 ? (
                        <div className="col-span-full p-8 text-center border border-white/5 rounded-2xl bg-white/5 text-neutral-500">
                            <p>No audits recorded yet.</p>
                        </div>
                    ) : (
                        history.map((record) => (
                            <div key={record.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div>
                                    <div className="font-medium text-white">{record.product_name}</div>
                                    <div className="text-xs text-neutral-400 font-mono">
                                        {new Date(record.created_at).toLocaleDateString()} • {record.ingredient_ids?.length || 0} actives
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {record.score !== undefined && record.score !== null ? (
                                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold font-mono border",
                                            record.score > 70 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                record.score > 40 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                                                    "bg-red-500/20 text-red-400 border-red-500/30"
                                        )}>
                                            SCORE: {record.score}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1 rounded-full text-xs font-bold font-mono border bg-neutral-500/20 text-neutral-400 border-neutral-500/30">
                                            SCORE: N/A
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* AI Assistant */}
            <AIChat context={`Score: ${finalScore}, Risk: ${status}, Actives: ${selectedIngredients.length}`} />

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
