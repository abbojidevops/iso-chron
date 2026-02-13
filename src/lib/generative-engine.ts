import { INGREDIENTS, Ingredient } from './ingredients';
import { runMolecularAudit } from './conflict-engine';

// Types for Generation
type SkinConcern = 'Acne' | 'Aging' | 'Hyperpigmentation' | 'Dehydration' | 'Sensitivity' | 'Dullness';
type SkinType = 'Oily' | 'Dry' | 'Combination' | 'Normal';

interface UserProfile {
    skinType: SkinType;
    concerns: SkinConcern[];
    phototype: string; // I-VI
    ageRange?: '20s' | '30s' | '40s' | '50+';
}

interface GeneratedRoutine {
    morning: string[]; // Ingredient IDs
    evening: string[]; // Ingredient IDs
    rationale: string[]; // Why we chose this
    focus: string; // "Barrier Repair & Glow"
}

// Knowledge Graph: Best Actives per Concern
const BEST_ACTIVES: Record<SkinConcern, string[]> = {
    'Acne': ['salicylic_acid', 'niacinamide', 'adapalene', 'benzoyl_peroxide'],
    'Aging': ['retinol', 'copper_peptides', 'glycolic_acid', 'vitamin_c'],
    'Hyperpigmentation': ['vitamin_c', 'alpha_arbutin', 'azelaic_acid', 'glycolic_acid'],
    'Dehydration': ['hyaluronic_acid', 'polyglutamic_acid', 'glycerin'],
    'Sensitivity': ['centella_asiatica', 'allantoin', 'ceramides'],
    'Dullness': ['vitamin_c', 'glycolic_acid', 'lactic_acid']
};

// Essential Supports (Always include one)
const SUPPORTS = {
    'Barrier': ['ceramides', 'panthenol'],
    'Hydration': ['hyaluronic_acid', 'glycerin'],
    'Protection': ['chemical_sunscreen', 'mineral_sunscreen']
};

export function generateRoutine(profile: UserProfile): GeneratedRoutine {
    const morning: string[] = [];
    const evening: string[] = [];
    const rationale: string[] = [];
    let focus = "Balanced Maintenance";

    // 1. Determine Primary Focus
    const primaryConcern = profile.concerns[0] || 'Dehydration';
    focus = `${primaryConcern} Control & Health`;

    // 2. Select Power Actives (Max 2 strong actives to avoid conflict)
    const candidates = BEST_ACTIVES[primaryConcern];

    // Morning Star
    if (primaryConcern === 'Hyperpigmentation' || primaryConcern === 'Dullness' || primaryConcern === 'Aging') {
        if (candidates.includes('vitamin_c')) {
            morning.push('vitamin_c');
            rationale.push("Vitamin C selected for AM antioxidant protection and brightening.");
        }
    } else if (primaryConcern === 'Acne') {
        morning.push('niacinamide');
        rationale.push("Niacinamide added to AM routine for oil control.");
    }

    // Evening Powerhouse
    if (profile.concerns.includes('Acne') || profile.concerns.includes('Aging')) {
        // Retinoid is king
        if (profile.skinType === 'Oily' || profile.skinType === 'Combination') {
            evening.push('adapalene'); // Gel based, good for acne
            rationale.push("Adapalene selected as stable PM retinoid for cell turnover.");
        } else {
            evening.push('retinol');
            rationale.push("Retinol selected for PM anti-aging.");
        }
    } else if (profile.concerns.includes('Dehydration')) {
        evening.push('polyglutamic_acid') || evening.push('hyaluronic_acid');
        rationale.push("Deep hydration focus for PM recovery.");
    }

    // 3. Add Support Layers (Hydration/Barrier) - CRITICAL for Generative Safety
    // Every routine needs hydration
    if (!morning.includes('hyaluronic_acid')) morning.push('hyaluronic_acid');
    evening.push('ceramides'); // Always repair barrier at night
    rationale.push("Ceramides added to PM to rebuild lipid barrier while you sleep.");

    // 4. Sun Protection (Non-negotiable)
    morning.push('chemical_sunscreen'); // Default to generic SPF
    rationale.push("SPF 50+ is mandatory for preventing further damage.");

    // 5. Audit & Refine (Self-Correction Loop)
    // We check our own work before returning it
    const amAudit = runMolecularAudit(morning, profile.phototype);
    const pmAudit = runMolecularAudit(evening, profile.phototype);

    if (amAudit.status === 'Hazardous' || pmAudit.status === 'Hazardous') {
        // Fallback: Strip to basics if we accidentally made a bomb
        return {
            morning: ['hyaluronic_acid', 'chemical_sunscreen'],
            evening: ['ceramides', 'centella_asiatica'],
            rationale: ["Complex routine generated conflicts. Reverted to 'Skin Fasting' reset mode for safety."],
            focus: "Emergency Barrier Reset"
        };
    }

    return {
        morning,
        evening,
        rationale,
        focus
    };
}
