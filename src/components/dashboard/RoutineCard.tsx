'use client'
import { MolecularRoutine } from '@/lib/types';
import { Trash2, RefreshCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { deleteRoutine } from '@/actions/delete-routine';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
        <div className={`relative p-6 rounded-3xl border transition-all duration-500 bg-white/5 backdrop-blur-xl group ${isHazardous ? 'border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-white/10 hover:border-blue-500/40'
            }`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-lg ${isHazardous ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                    {isHazardous ? <AlertTriangle className="text-red-500" /> : <ShieldCheck className="text-blue-500" />}
                </div>
                <span className="text-xs font-mono text-white/30">{new Date(routine.created_at).toLocaleDateString()}</span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-white">{routine.routine_name}</h3>
            <p className="text-sm text-white/50 mb-4 truncate">{routine.ingredients.join(' • ')}</p>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${isHazardous ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${routine.safety_score}%` }}
                    />
                </div>
                <span className={`font-mono text-sm ${isHazardous ? 'text-red-500' : 'text-blue-500'}`}>
                    {routine.safety_score}%
                </span>
            </div>

            <div className="flex gap-2 border-t border-white/5 pt-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold hover:bg-white/5 rounded-lg transition-all text-white/70 hover:text-white">
                    <RefreshCcw size={14} /> RE-SCAN
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-white/20 hover:text-red-500 transition-all disabled:opacity-50"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
