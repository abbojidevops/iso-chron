import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import RoutineCard from '@/components/dashboard/RoutineCard';
import { MolecularRoutine } from '@/lib/types';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';

export default async function Dashboard() {
    const { userId, getToken } = await auth();

    if (!userId) {
        return <div className="min-h-screen bg-[#0B0B0B] text-white p-8 flex items-center justify-center">Please Sign In</div>;
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

    if (error) return <div className="text-white p-8">Error loading routines: {error.message}</div>;

    return (
        <div className="min-h-screen bg-[#0B0B0B] text-white p-8 pb-20">
            <header className="mb-12 flex justify-between items-center max-w-7xl mx-auto">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter italic flex items-center gap-3">
                        <FlaskConical className="w-8 h-8 text-blue-500" />
                        NEO-SHELF
                    </h1>
                    <p className="text-blue-500/60 font-mono text-sm uppercase tracking-widest mt-2">
                        Your Molecular Archive
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <button className="px-6 py-2 bg-blue-600 rounded-full text-sm font-bold hover:bg-blue-500 transition-all border border-blue-400/20 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        New Audit +
                    </button>
                </Link>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines?.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-white/10 rounded-3xl bg-white/5">
                        <p className="text-neutral-500 mb-4">No molecular data archived.</p>
                        <Link href="/dashboard/new">
                            <button className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                Initialize first scan
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
