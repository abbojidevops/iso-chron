'use client'
import { MolecularRoutine } from '@/lib/types';
import { Trash2, RefreshCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { deleteRoutine } from '@/actions/delete-routine';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function RoutineCard({ routine }: { routine: MolecularRoutine }) {
    const isHazardous = routine.status === 'Hazardous';
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this routine?')) return;
        setIsDeleting(true);
        const result = await deleteRoutine(routine.id);
        setIsDeleting(false);
        if (result.success) {
            // Refresh the page to reflect changes
            router.refresh();
        } else {
            alert('Failed to delete routine');
        }
    };

    return (
        <div className={`relative p-6 rounded-3xl border transition-all duration-500 glass-card group ${isHazardous ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-white/40 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10'
            }`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-xl ${isHazardous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isHazardous ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                </div>
                <span className="text-xs font-mono text-neutral-400">{new Date(routine.created_at).toLocaleDateString()}</span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-neutral-900">{routine.routine_name}</h3>
            <p className="text-sm text-neutral-500 mb-6 truncate font-medium">{routine.ingredients.join(' • ')}</p>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${isHazardous ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${routine.safety_score}%` }}
                    />
                </div>
                <span className={`font-mono text-sm font-bold ${isHazardous ? 'text-red-500' : 'text-blue-500'}`}>
                    {routine.safety_score}%
                </span>
            </div>

            <div className="flex gap-2 border-t border-neutral-100 pt-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                    href={`/dashboard/new?re-scan=${routine.ingredients.join(',')}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold hover:bg-neutral-50 rounded-lg transition-all text-neutral-500 hover:text-blue-600"
                >
                    <RefreshCcw size={14} /> RE-SCAN
                </Link>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-all disabled:opacity-50 hover:bg-red-50 rounded-lg"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
