"use client";

import { useState } from 'react';
import { FlaskConical, Zap, CheckCircle, Sparkles, Lock } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function PricingPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleCheckout = async (planType: 'full' | 'monthly') => {
        setIsLoading(planType);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType }),
            });

            if (!res.ok) throw new Error('Checkout failed');

            const { url } = await res.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error(error);
            alert('Failed to initiate checkout. Please try again.');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0B] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 p-8 flex justify-between items-center max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-3 group">
                    <FlaskConical className="w-8 h-8 text-blue-500 group-hover:rotate-12 transition-transform" />
                    <span className="text-2xl font-bold tracking-tight">ISO-CHRON</span>
                </Link>
                <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
                    ← Back to Dashboard
                </Link>
            </header>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-xs font-mono uppercase tracking-widest mb-6">
                    <Sparkles className="w-4 h-4" />
                    Professional Molecular Analysis
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Unlock Your Skin's<br />Chemical Blueprint
                </h1>
                <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
                    Choose the plan that fits your skincare journey. All plans include conflict detection, UV correlation, and AI-powered recommendations.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="relative z-10 max-w-6xl mx-auto px-8 pb-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Full Audit Plan */}
                    <div className="group relative p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl hover:border-blue-500/50 transition-all duration-500 flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <FlaskConical className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold">Full Molecular Audit</h3>
                            </div>

                            <div className="mb-6">
                                <div className="text-6xl font-black italic tracking-tighter mb-2">
                                    $45<span className="text-lg font-mono text-white/30 not-italic">.00</span>
                                </div>
                                <p className="text-sm text-white/50">One-time payment</p>
                            </div>

                            <ul className="space-y-4 mb-8 text-white/70">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <span>Complete chemical conflict analysis</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <span>UV index correlation alerts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <span>AM/PM routine timeline</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <span>Lifetime access to your audit</span>
                                </li>
                            </ul>

                            <SignedIn>
                                <button
                                    onClick={() => handleCheckout('full')}
                                    disabled={isLoading === 'full'}
                                    className="w-full py-4 bg-white text-black font-black rounded-full hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                                >
                                    {isLoading === 'full' ? (
                                        <>Processing...</>
                                    ) : (
                                        <>INITIATE AUDIT →</>
                                    )}
                                </button>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Sign In to Purchase
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>

                    {/* Monthly Sync Plan */}
                    <div className="group relative p-8 rounded-[40px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/50 backdrop-blur-3xl hover:border-purple-400 transition-all duration-500 flex flex-col">
                        {/* Popular Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-bold uppercase tracking-wider">
                            Most Popular
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Zap className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold">Monthly Sync</h3>
                            </div>

                            <div className="mb-6">
                                <div className="text-6xl font-black italic tracking-tighter mb-2">
                                    $9<span className="text-lg font-mono text-white/30 not-italic">.99</span>
                                </div>
                                <p className="text-sm text-white/50">per month</p>
                            </div>

                            <ul className="space-y-4 mb-8 text-white/70">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <span className="font-semibold text-white">Everything in Full Audit, plus:</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <span>Unlimited routine audits</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <span>Priority AI support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <span>Early access to new features</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <span>Cancel anytime</span>
                                </li>
                            </ul>

                            <SignedIn>
                                <button
                                    onClick={() => handleCheckout('monthly')}
                                    disabled={isLoading === 'monthly'}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black rounded-full hover:from-purple-400 hover:to-blue-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"
                                >
                                    {isLoading === 'monthly' ? (
                                        <>Processing...</>
                                    ) : (
                                        <>START SUBSCRIPTION →</>
                                    )}
                                </button>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Sign In to Subscribe
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-white/40 mb-4">Trusted by skincare enthusiasts worldwide</p>
                    <div className="flex items-center justify-center gap-8 text-white/20">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Instant Access</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Cancel Anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
