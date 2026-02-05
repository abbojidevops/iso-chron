"use client";

import { useState } from "react";
import { UserButton, SignInButton, SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import { INGREDIENTS, checkConflicts, type Conflict } from "@/lib/ingredients";
import { cn } from "@/lib/utils";
import { AlertTriangle, X, FlaskConical, ShieldCheck, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

export default function Dashboard() {
    const { session } = useSession();
    const { isSignedIn, user } = useUser();
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [conflicts, setConflicts] = useState<Conflict[]>([]);

    const toggleIngredient = (id: string) => {
        let next: string[];
        if (selectedIngredients.includes(id)) {
            next = selectedIngredients.filter((i) => i !== id);
        } else {
            next = [...selectedIngredients, id];
        }
        setSelectedIngredients(next);
        setConflicts(checkConflicts(next));
    };

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!isSignedIn) return;

        setSaving(true);
        try {
            // 1. Get the Supabase Token from Clerk
            // IMPORTANT: User must create a JWT Template named 'supabase' in Clerk Dashboard
            const token = await session?.getToken({ template: 'supabase' });

            if (!token) {
                // Fallback for user if they haven't set up the template yet
                console.warn("No Supabase token found. Check Clerk Dashboard > JWT Templates.");
                // We'll throw only if we strictly need RLS. 
                // For now, let's try to alert nicely.
                throw new Error("Missing Supabase JWT Template in Clerk.");
            }

            // 2. Initialize Supabase with the Token
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const supabase = createClient(supabaseUrl, supabaseKey, {
                global: { headers: { Authorization: `Bearer ${token}` } },
            });

            // 3. Insert Data
            const { error } = await supabase.from('user_products').insert({
                user_id: user.id,
                product_name: "My Custom Routine",
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
                    {/* Premium Badge - Only show if not signed in or actual premium logic */}
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

                {/* Ingredient Selector - Bento Item 1 (Left Col) */}
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

                {/* Audit Results - Bento Item 2 (Right Col) */}
                <div className={cn(
                    "md:col-span-5 bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-8 border-l-4 transition-colors duration-500 flex flex-col",
                    conflicts.length > 0 ? "border-red-500 bg-red-950/10" : "border-green-500 bg-green-950/10"
                )}>
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        Molecular Analysis
                        {conflicts.length > 0 ? (
                            <AlertTriangle className="w-5 h-5 text-red-500 ml-auto" />
                        ) : (
                            <ShieldCheck className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                    </h2>

                    <div className="flex-1 space-y-4">
                        <AnimatePresence>
                            {conflicts.length === 0 && selectedIngredients.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center text-neutral-500 space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p>Routine is chemically stable.</p>
                                </motion.div>
                            )}

                            {selectedIngredients.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-600">
                                    <p>Select ingredients to begin audit.</p>
                                </div>
                            )}

                            {conflicts.map((conflict, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-red-200 font-semibold text-sm">
                                            <span className="uppercase">{INGREDIENTS.find(i => i.id === conflict.ingredientA)?.name}</span>
                                            <span>+</span>
                                            <span className="uppercase">{INGREDIENTS.find(i => i.id === conflict.ingredientB)?.name}</span>
                                        </div>
                                        <span className="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-wide">
                                            {conflict.severity} Risk
                                        </span>
                                    </div>
                                    <p className="text-sm text-red-200/70 leading-relaxed">
                                        {conflict.reason}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center text-sm text-neutral-400">
                            <span>Audit Cost</span>
                            <span className="text-white line-through">$45.00</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold text-white mt-1">
                            <span>Total</span>
                            <span className="text-green-400">FREE</span>
                        </div>

                        {isSignedIn ? (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full mt-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? "Saving..." : (
                                    <>
                                        <span>Save Routine to Profile</span>
                                    </>
                                )}
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
