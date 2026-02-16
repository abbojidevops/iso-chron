"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlaskConical, History, ShieldAlert, Calendar, Settings, LogOut, Menu, X, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignOutButton } from "@clerk/nextjs";

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
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/50 backdrop-blur-md rounded-full border border-neutral-200 text-neutral-900"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-xl border-r border-neutral-200 flex flex-col transition-transform duration-300 md:translate-x-0 shadow-2xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FlaskConical className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-neutral-900">ISO-CHRON</h1>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono tracking-widest pl-10 uppercase">Scientific Efficiency</p>
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
                                        ? "text-blue-700 bg-blue-50"
                                        : "text-neutral-500 hover:text-blue-600 hover:bg-neutral-50"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-neutral-400 group-hover:text-blue-500")} />
                                <span className="relative z-10">{item.name}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute inset-0 bg-blue-100/50 z-0 border-r-2 border-blue-500"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-neutral-100 space-y-2">
                    <Link href="/how-it-works">
                        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-500 rounded-xl hover:bg-neutral-50 hover:text-blue-600 transition-all w-full text-left">
                            <HelpCircle className="w-5 h-5" />
                            <span>How it Works</span>
                        </button>
                    </Link>

                    <div className="px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-neutral-500 font-medium">System Online</span>
                        </div>
                        <SignOutButton>
                            <button className="text-neutral-400 hover:text-red-500 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
