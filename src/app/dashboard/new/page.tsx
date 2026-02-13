"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { UserButton, SignInButton, SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import { INGREDIENTS, Ingredient } from "@/lib/ingredients";
import { runMolecularAudit } from "@/lib/conflict-engine"; // New Engine
import { runChronoSplit, getIngredientName } from "@/lib/chrono-splitter"; // Chrono Logic
import { getLocalUVIndex, isSunSafe } from "@/lib/uv-api"; // UV Logic
import { cn } from "@/lib/utils";
import { AlertTriangle, X, FlaskConical, ShieldCheck, Lock, CheckCircle, Flame, Zap, Sun, Moon, Loader2, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { MolecularVisualizer } from "@/components/canvas/MolecularVisualizer";
// Imports moved to top
import { SensitizationMeter } from "@/components/dashboard/SensitizationMeter";
import { OCRScanner } from "@/components/ocr/OCRScanner";
import { AIChat } from "@/components/chat/AIChat";
import { VoiceCommand } from "@/components/voice/VoiceCommand"; // Voice
import { generateRoutine } from "@/lib/generative-engine"; // Gen AI

// Lazy load removed
// const SensitizationMeter = (await import("@/components/dashboard/SensitizationMeter")).SensitizationMeter;
import { MolecularRoutine } from "@/lib/types";
import { saveMolecularRoutine } from "@/actions/save-routine";
import { CircularGauge } from "@/components/ui/CircularGauge";

// Custom Laser Sweep Animation
const laserAnimationClass = "after:content-[''] after:absolute after:top-0 after:left-[-100%] after:w-[50%] after:h-full after:bg-gradient-to-r after:from-transparent after:via-blue-500/20 after:to-transparent after:skew-x-[-20deg] after:animate-laser-sweep after:pointer-events-none";

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

            // Check for Re-Scan
            const reScanIngredients = searchParams.get('re-scan');
            if (reScanIngredients) {
                // Split by comma
                const rawIds = reScanIngredients.split(',');
                // Filter to ensure they exist in our DB (optional but good for safety)
                // Just force set them for now to ensure they show up
                setSelectedIngredients(rawIds);
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
    const [history, setHistory] = useState<MolecularRoutine[]>([]);

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

            // Fetch from new 'routines' table
            const { data } = await supabase
                .from('routines')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setHistory(data as MolecularRoutine[]);
        } catch (e) {
            console.error("History fetch error:", e);
        }
    };

    // Fetch History on Mount
    useEffect(() => {
        if (isSignedIn) fetchHistory();
    }, [isSignedIn, user]);

    // Phototype State (Default I-III)
    const [phototype, setPhototype] = useState("I-III");

    // Derived state from the new engine
    const { finalScore, conflicts, status } = runMolecularAudit(selectedIngredients, phototype);

    // Predictive Bio-Diagnostic Suite
    const [sensitization, setSensitization] = useState<{ risk: string; score: number; flags: string[] } | null>(null);
    const [stability, setStability] = useState<{ state: string; stabilityScore: number; details: string } | null>(null);
    const [microbiome, setMicrobiome] = useState<{ status: string; metrics: any } | null>(null);

    // Run Diagnostics when ingredients change
    useEffect(() => {
        const analyze = async () => {
            if (selectedIngredients.length === 0) {
                setSensitization(null);
                setStability(null);
                setMicrobiome(null);
                return;
            }

            const activeNames = ingredients.filter(i => selectedIngredients.includes(i.id)).map(i => i.name);

            // 1. Toxicology
            const { predictSensitization } = await import("@/lib/toxicology");
            const sensResult = predictSensitization(activeNames, 85); // Mock barrier heatlh 85
            setSensitization(sensResult);

            // 2. Stability
            const { predictStability } = await import("@/lib/stability");
            const stabResult = predictStability(activeNames, 5.5); // pH 5.5
            setStability(stabResult);

            // 3. Microbiome
            const { analyzeMicrobiome } = await import("@/lib/microbiome");
            const microResult = analyzeMicrobiome(activeNames, []);
            setMicrobiome(microResult);
        };
        analyze();
    }, [selectedIngredients, ingredients]);

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

            // Use Server Action
            const result = await saveMolecularRoutine(token, {
                ingredients: selectedIngredients,
                safetyScore: finalScore,
                status: status,
                // New Data points (if schema allows, otherwise ignore for now)
                // We will add the new columns to the action later
            });

            if (!result.success) throw new Error(result.error);

            alert("Routine saved successfully to your Skin Dossier!");

            // Refresh history after save
            await fetchHistory();

        } catch (e) {
            console.error(e);
            alert("Error saving routine: " + (e as Error).message);
        } finally {
            setSaving(false);
        }
    };


    // Voice Handler
    const handleVoiceCommand = (cmd: string) => {
        if (cmd.includes("analyze") || cmd.includes("safety")) {
            // Trigger audit visual (could scroll to meter)
            alert("Running deep safety analysis...");
        } else if (cmd.includes("generate") || cmd.includes("routine")) {
            handleGenerateRoutine();
        }
    };

    const [aiContext, setAiContext] = useState<string>("");

    const [aiContext, setAiContext] = useState<string>("");

    // Generative AI Handler
    const handleGenerateRoutine = () => {
        // Mock Profile for now (could come from DB)
        const profile = {
            skinType: 'Combination' as const,
            concerns: ['Aging', 'Dehydration'] as any[],
            phototype: phototype
        };

        const generated = generateRoutine(profile);

        // Find IDs in our ingredient list to make them selectable
        const allGeneratedIds = [...generated.morning, ...generated.evening];
        // Filter out duplicates
        const uniqueIds = Array.from(new Set(allGeneratedIds));

        // Map to full ingredients to confirm they exist (in real app)
        const validIds = uniqueIds.filter(id => INGREDIENTS.find(ing => ing.id === id));

        setSelectedIngredients(validIds);
        setAiContext(`Just generated a routine focused on ${generated.focus}. Rationale: ${generated.rationale.join(" ")}`);
    };

    // Lazy load removed -> Switched to static import

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Molecular Vault</h2>
                    <p className="text-neutral-400 text-sm">Analyze compound interactions and optimize routines.</p>
                </div>

                {/* User & Global Actions */}
                <div className="flex items-center gap-4">
                    {/* Gen AI Button */}
                    <button
                        onClick={handleGenerateRoutine}
                        className="hidden md:flex items-center gap-2 px-4 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-xs transition-colors"
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        AI GENERATE
                    </button>

                    {/* Phototype Calibration */}
                    <select
                        className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={phototype}
                        onChange={(e) => setPhototype(e.target.value)}
                    >
                        <option value="I-III">Type I-III (Light)</option>
                        <option value="IV-VI">Type IV-VI (Dark)</option>
                    </select>

                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${status === 'Optimal' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                        <span className="text-xs font-mono text-neutral-300 uppercase">{status} Status</span>
                    </div>
                </div>
            </header>

            {/* MAIN COMMAND GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">

                {/* LEFT COLUMN: HERO VISUALIZER (50%) */}
                <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                    {/* 3D SANDBOX CARD */}
                    <div
                        key={selectedIngredients.join('-')}
                        className={cn(
                            "relative shrink-0 h-[400px] bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden group shadow-2xl",
                            selectedIngredients.length > 0 && laserAnimationClass
                        )}
                    >
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none opacity-50" />

                        {/* Visualizer Content */}
                        <div className="absolute inset-0 z-10">
                            {selectedIngredients.length > 0 ? (
                                <AnimatePresence mode="wait">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                                        <MolecularVisualizer
                                            ingredients={ingredients.filter(i => selectedIngredients.includes(i.id))}
                                            conflicts={conflicts}
                                            status={status}
                                            score={finalScore} // Linked Score
                                            stability={stability || undefined}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-600 space-y-4">
                                    <FlaskConical className="w-12 h-12 opacity-20" />
                                    <p className="font-light tracking-widest uppercase text-xs">Awaiting Compounds...</p>
                                </div>
                            )}
                        </div>

                        {/* Overlay Info */}
                        <div className="absolute bottom-6 left-6 z-20">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                Serum Simulation
                                <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-neutral-400 font-mono">REAL-TIME</span>
                            </h3>
                            {stability && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${stability.state === 'Stable' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-xs text-neutral-300">Phase: {stability.state}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DIAGNOSTIC METRICS ROW */}
                    {selectedIngredients.length > 0 && sensitization && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sensitization Meter */}
                            <SensitizationMeter
                                score={sensitization.score}
                                riskLabel={sensitization.risk}
                                flags={sensitization.flags}
                            />

                            {/* Microbiome Stats */}
                            <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Flora Diversity</h3>
                                    <div className={`p-2 rounded-full bg-white/5 ${microbiome?.status === 'Diverse' ? 'text-green-400' : 'text-amber-400'}`}>
                                        <Zap className="w-4 h-4" />
                                    </div>
                                </div>

                                {microbiome && (
                                    <>
                                        <div className="text-3xl font-bold text-white mb-1">{Math.round(microbiome.metrics.floraDiversity * 100)}%</div>
                                        <div className="text-xs text-neutral-500 mb-4">Shannon Index: {microbiome.status}</div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs text-neutral-400">
                                                <span>Barrier Integrity</span>
                                                <span className="text-white">{microbiome.metrics.barrierIntegrity}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${microbiome.metrics.barrierIntegrity}%` }} />
                                            </div>

                                            <div className="flex justify-between text-xs text-neutral-400">
                                                <span>Hydration Sig.</span>
                                                <span className="text-white">{microbiome.metrics.hydrationSignature}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-400" style={{ width: `${microbiome.metrics.hydrationSignature}%` }} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* METRICS & ACTIONS ROW (Legacy) */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* SAFETY GAUGE CARD */}
                        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-[200px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                            <CircularGauge score={finalScore} size={140} />
                            {uvAlert && (
                                <div className="absolute bottom-2 left-0 right-0 text-center">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase animate-pulse">UV WARNING ACTIVE</span>
                                </div>
                            )}
                        </div>

                        {/* ACTION CARD */}
                        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-[200px]">
                            <div>
                                <div className="text-sm text-neutral-400 mb-1">Total Estimated Cost</div>
                                <div className="text-3xl font-bold text-white">$45.00</div>
                            </div>

                            <div className="space-y-2">
                                {isSignedIn ? (
                                    <button
                                        onClick={saving ? undefined : handleSave}
                                        disabled={saving}
                                        className={cn("w-full py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm",
                                            saving && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        Save Routine
                                    </button>
                                ) : (
                                    <SignInButton mode="modal">
                                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-sm">
                                            Sign In to Save
                                        </button>
                                    </SignInButton>
                                )}

                                {/* Premium Trigger */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/checkout', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ planType: 'full' })
                                            });
                                            if (!res.ok) throw new Error('Checkout Failed');
                                            const data = await res.json();
                                            if (data.url) window.location.href = data.url;
                                        } catch (e) { alert("Checkout Error"); }
                                    }}
                                    className="w-full py-2 text-xs text-neutral-500 hover:text-white transition-colors uppercase tracking-wider font-medium"
                                >
                                    Purchase Premium Audit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: CONTROLS & CHRONO (50%) */}
                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    {/* INGREDIENT SELECTOR (Scrollable) */}
                    <div className="flex-1 bg-card/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-blue-500" />
                                Active Ingredients
                            </h3>
                            <div className="flex gap-2">
                                <OCRScanner onScanComplete={(found) => {
                                    const merged = Array.from(new Set([...selectedIngredients, ...found]));
                                    setSelectedIngredients(merged);
                                }} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {ingredients.map((ing) => {
                                    const active = selectedIngredients.includes(ing.id);
                                    return (
                                        <button
                                            key={ing.id}
                                            onClick={() => toggleIngredient(ing.id)}
                                            className={cn(
                                                "relative p-3 rounded-xl text-left transition-all duration-200 border group",
                                                active
                                                    ? "bg-blue-500/20 border-blue-500/50 text-blue-100"
                                                    : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="text-[10px] uppercase tracking-wider opacity-50">{ing.category}</span>
                                                {active && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_5px_#60a5fa]" />}
                                            </div>
                                            <div className="font-medium text-sm mt-1 truncate group-hover:whitespace-normal">{ing.name}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* NEW: 24-HOUR SEQUENCE CARD (CHRONO) */}
                    <div className="shrink-0 bg-neutral-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-purple-400" />
                                24-Hour Sequence
                            </h3>
                            {isPremium ? (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">SYNC ACTIVE</span>
                            ) : (
                                <Lock className="w-4 h-4 text-neutral-600" />
                            )}
                        </div>

                        {/* Premium Lock Overlay */}
                        {!isPremium && (
                            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col text-center p-6">
                                <h4 className="text-white font-bold mb-1">Unlock Chrono-Sync</h4>
                                <button
                                    className="px-4 py-2 mt-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                                    onClick={() => alert("Redirecting to checkout...")}
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        )}

                        {/* Timeline Visualizer */}
                        <div className={cn("flex flex-col gap-4", !isPremium && "opacity-20 blur-sm")}>
                            {/* AM Track */}
                            <div className="flex items-center gap-4">
                                <div className="w-8 text-xs font-bold text-orange-400 uppercase">AM</div>
                                <div className="flex-1 h-12 bg-white/5 rounded-xl flex items-center px-2 gap-2 overflow-hidden relative">
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0" />
                                    {runChronoSplit(selectedIngredients).am.map(id => (
                                        <div key={id} className="h-8 px-3 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30 text-[10px] text-orange-200 whitespace-nowrap">
                                            {getIngredientName(id)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PM Track */}
                            <div className="flex items-center gap-4">
                                <div className="w-8 text-xs font-bold text-indigo-400 uppercase">PM</div>
                                <div className="flex-1 h-12 bg-white/5 rounded-xl flex items-center px-2 gap-2 overflow-hidden relative">
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
                                    {runChronoSplit(selectedIngredients).pm.map(id => (
                                        <div key={id} className="h-8 px-3 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30 text-[10px] text-indigo-200 whitespace-nowrap">
                                            {getIngredientName(id)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* AI Assistant Floating */}
            <AIChat context={aiContext || `Score: ${finalScore}, Status: ${status}`} />
            {/* Voice Control */}
            <VoiceCommand onCommand={handleVoiceCommand} />
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
