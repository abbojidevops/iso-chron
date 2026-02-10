'use client';

import { SignUp } from "@clerk/nextjs";
import { FlaskConical, Sparkles } from "lucide-react";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

            {/* Glass Container */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Logo/Header */}
                <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <FlaskConical className="w-8 h-8 text-purple-500" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white via-purple-100 to-white/50 bg-clip-text text-transparent">
                        Join ISO-CHRON
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-purple-300/80 font-mono uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Begin Your Audit
                    </div>
                </div>

                {/* Clerk Sign Up Component */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] p-8",
                                headerTitle: "text-2xl font-bold text-white",
                                headerSubtitle: "text-neutral-400",
                                socialButtonsBlockButton: "bg-white/10 border border-white/10 hover:bg-white/20 text-white",
                                socialButtonsBlockButtonText: "text-white font-medium",
                                dividerLine: "bg-white/10",
                                dividerText: "text-white/40",
                                formFieldLabel: "text-neutral-300",
                                formFieldInput: "bg-black/40 border border-white/10 text-white focus:border-purple-500 transition-colors rounded-xl",
                                footerActionLink: "text-purple-400 hover:text-purple-300",
                                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-xl py-3",
                                footer: "hidden"
                            },
                            layout: {
                                socialButtonsPlacement: "top",
                                showOptionalFields: false,
                            }
                        }}
                    />
                </div>

                {/* Footer Text */}
                <p className="mt-8 text-xs text-white/20 font-mono">
                    SECURE ENCRYPTED CONNECTION • V1.2.0
                </p>
            </div>
        </div>
    );
}
