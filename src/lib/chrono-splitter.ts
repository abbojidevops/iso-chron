import { INGREDIENTS } from "./ingredients";

export type RoutineTime = 'AM' | 'PM' | 'Any';

export type SplitResult = {
    am: string[]; // IDs
    pm: string[]; // IDs
    any: string[]; // IDs
};

const TIME_MAP: Record<string, RoutineTime> = {
    'retinol': 'PM', // Photosensitive
    'vitamin_c': 'AM', // Antioxidant protection against UV
    'aha': 'PM', // Increases sun sensitivity
    'bha': 'PM', // Usually PM to avoid over-exfoliation during day
    'benzoyl_peroxide': 'PM', // Can stain/bleach and cause sensitivity
    'niacinamide': 'Any', // Stable, good for both
};

export const runChronoSplit = (selectedIds: string[]): SplitResult => {
    const result: SplitResult = { am: [], pm: [], any: [] };

    selectedIds.forEach(id => {
        const time = TIME_MAP[id] || 'Any';
        if (time === 'AM') result.am.push(id);
        else if (time === 'PM') result.pm.push(id);
        else result.any.push(id);
    });

    // Optimization: If "Any" ingredients exist, balance them.
    // For this MVP, we will just list them in both or separate section.
    // Let's return them as 'Any' so the UI can decide (e.g., show in both columns).

    return result;
};

export const getIngredientName = (id: string) => {
    return INGREDIENTS.find(i => i.id === id)?.name || id;
};
