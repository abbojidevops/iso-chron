export interface MolecularRoutine {
    id: string;
    user_id: string;
    routine_name: string;
    ingredients: string[];
    safety_score: number;
    status: 'Optimal' | 'Caution' | 'Hazardous' | 'Pending';
    created_at: string;
}
