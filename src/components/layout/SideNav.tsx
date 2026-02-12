"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlaskConical, History, ShieldAlert, Calendar, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignOutButton } from "@clerk/nextjs";
import { HelpCircle } from "lucide-react";



const navItems = [
    { name: "Molecular Vault", href: "/dashboard/new", icon: FlaskConical },
    { name: "Chrono-Sync", href: "/dashboard/chrono", icon: History }, // Placeholder path for now
    { name: "Safety Reports", href: "/dashboard", icon: ShieldAlert },
    { name: "Hormonal Calendar", href: "/dashboard/calendar", icon: Calendar }, // Placeholder
];

export function SideNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-[#050505]/80 backdrop-blur-[25px] border-r border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.4)]",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <FlaskConical className="w-4 h-4 text-blue-400" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">ISO-CHRON</h1>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono tracking-widest pl-10">COMMAND CENTER v2.1</p>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-blue-500/10 border border-blue-500/20"
                                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-400" : "text-neutral-500 group-hover:text-white")} />
                                <span className="relative z-10">{item.name}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-blue-500/5 z-0"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    <Link href="/how-it-works">
                        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-400 rounded-xl hover:bg-white/5 hover:text-white transition-all w-full text-left">
                            <HelpCircle className="w-5 h-5" />
                            <span>How it Works</span>
                        </button>
                    </Link>

                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-neutral-400">System Online</span>
                        </div>
                        <SignOutButton>
                            <button className="text-neutral-500 hover:text-red-400 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
