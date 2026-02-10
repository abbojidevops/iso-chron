import { INGREDIENTS } from "./ingredients";

export type RoutineTime = 'AM' | 'PM' | 'Any';

export type SplitResult = {
    am: string[]; // IDs
    pm: string[]; // IDs
    any: string[]; // IDs
};

const TIME_MAP: Record<string, RoutineTime> = {
    // --- PM ONLY (Photosensitive / Degradable) ---
    'tretinoin': 'PM',
    'adapalene': 'PM',
    'retinol': 'PM',
    'retinaldehyde': 'PM',
    'glycolic_acid': 'PM',
    'lactic_acid': 'PM',
    'mandelic_acid': 'PM',
    'salicylic_acid': 'PM', // Can be AM, but usually PM to avoid UV risk
    'pha': 'Any', // Gentle enough for AM
    'benzoyl_peroxide': 'PM', // Bleaching/Staining issue + sensitivity
    'hydroquinone': 'PM', // Strong brightener, PM preferred

    // --- AM PREFERRED (Protection / Antioxidant) ---
    'vitamin_c': 'AM', // Boosts SPF
    'ascorbic_acid': 'AM',
    'vitamin_c_derivative': 'AM',
    'ferulic_acid': 'AM',
    'vitamin_e': 'AM',
    'resveratrol': 'AM', // Can be both, but great for day protection
    'green_tea': 'AM',
    'spf_mineral': 'AM',
    'spf_chemical': 'AM',

    // --- ANY TIME (Hydration / Barrier / Stable) ---
    'niacinamide': 'Any',
    'hyaluronic_acid': 'Any',
    'glycerin': 'Any',
    'snail_mucin': 'Any',
    'polyglutamic_acid': 'Any',
    'ceramides': 'Any',
    'panthenol': 'Any',
    'centella': 'Any',
    'cholesterol': 'Any',
    'allantoin': 'Any',
    'azelaic_acid': 'Any', // Safe for AM/PM
    'bakuchiol': 'Any', // Stable Retinol alt
    'copper_peptides': 'PM', // Often expensive/fragile, PM safe bet, but can be AM
    'matrixyl': 'Any',
    'argireline': 'Any',
    'egf': 'PM', // Regenerative, best for sleep
    'alpha_arbutin': 'Any',
    'kojic_acid': 'PM', // Can be photosensitive
    'tranexamic_acid': 'Any',
    'licorice_root': 'Any',
    'sulfur': 'PM', // Odor/Texture
    'tea_tree': 'Any',
};

export const runChronoSplit = (selectedIds: string[]): SplitResult => {
    const result: SplitResult = { am: [], pm: [], any: [] };

    selectedIds.forEach(id => {
        const time = TIME_MAP[id] || 'Any'; // Default to Any if unknown
        if (time === 'AM') result.am.push(id);
        else if (time === 'PM') result.pm.push(id);
        else result.any.push(id);
    });

    return result;
};

export const getIngredientName = (id: string) => {
    return INGREDIENTS.find(i => i.id === id)?.name || id;
};
