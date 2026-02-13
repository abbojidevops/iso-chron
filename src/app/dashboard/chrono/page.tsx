import { ChronoSyncTimeline } from "@/components/dashboard/ChronoSyncTimeline";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChronoPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/new">
                    <button className="p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Chrono-Sync</h1>
                    <p className="text-neutral-500">24-Hour Molecular Sequencing Engine.</p>
                </div>
            </div>

            <ChronoSyncTimeline />
        </div>
    );
}
