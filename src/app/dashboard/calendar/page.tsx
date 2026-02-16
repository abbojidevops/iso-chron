import { HormonalCalendar } from "@/components/dashboard/HormonalCalendar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { viewport } from "@/app/layout"; // Import viewport to ensure inheritance or add if needed, actually Next.js 14 inherits naturally.

export default function CalendarPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/new">
                    <button className="p-2 rounded-full hover:bg-black/5 text-neutral-400 hover:text-neutral-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Hormonal Sync</h1>
                    <p className="text-neutral-500">Align your skincare actives with your biological rhythm.</p>
                </div>
            </div>

            <HormonalCalendar />
        </div>
    );
}
