import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import RoutineCard from '@/components/dashboard/RoutineCard';
import { MolecularRoutine } from '@/lib/types';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';

export default async function Dashboard() {
    const { userId, getToken } = await auth();

    if (!userId) {
        return <div className="min-h-screen bg-neutral-50 text-neutral-900 p-8 flex items-center justify-center">Please Sign In</div>;
    }

    const token = await getToken({ template: 'supabase' });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Fetch routines for the authenticated user
    const { data: routines, error } = await supabase
        .from('routines')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return <div className="text-red-500 p-8">Error loading routines: {error.message}</div>;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Safety Reports</h2>
                    <p className="text-neutral-500 text-sm">Review your past molecular audits and safety scores.</p>
                </div>

                <Link href="/dashboard/new">
                    <button className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30">
                        <FlaskConical className="w-3 h-3" />
                        New Analysis
                    </button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines?.length === 0 ? (
                    <div className="col-span-full py-20 border border-dashed border-neutral-200 rounded-3xl bg-white/40 flex flex-col items-center justify-center text-center">
                        <FlaskConical className="w-12 h-12 text-neutral-300 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">No Archives Found</h3>
                        <p className="text-neutral-500 text-sm max-w-xs mb-6">Your molecular vault is empty. Initialize a scan to begin data collection.</p>
                        <Link href="/dashboard/new">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-bold tracking-wider hover:underline">
                                INITIALIZE_SCAN
                            </button>
                        </Link>
                    </div>
                ) : (
                    routines?.map((routine: MolecularRoutine) => (
                        <RoutineCard key={routine.id} routine={routine} />
                    ))
                )}
            </div>
        </div>
    );
}
