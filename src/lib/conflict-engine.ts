import { INGREDIENTS, isCategory } from './ingredients';

export type ConflictResult = {
    severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Synergy';
    type: string;
    message: string;
    scoreImpact: number; // Negative for conflicts, Positive for synergy
};

// Fitzpatrick Phototype Multipliers
// Higher phototypes have higher risk with specific acids (PIH risk) but better tolerance to sun
const PHOTOTYPE_WEIGHTS: Record<string, Record<string, number>> = {
    "IV-VI": { // Darker skin
        "Glycolic Acid": 1.5, // Higher risk of irritation/pigmentation
        "Retinol": 1.2,
        "Vitamin C": 1.0
    },
    "I-III": { // Lighter skin
        "Glycolic Acid": 1.0,
        "Retinol": 1.0,
        "Vitamin C": 1.0
    }
};

export const runMolecularAudit = (selectedIngredients: string[], phototype: string = "I-III") => {
    let safetyScore = 100;
    const activeConflicts: ConflictResult[] = [];

    // Helper to check if ID or Category exists in selection
    const has = (id: string) => selectedIngredients.includes(id);
    const hasCat = (cat: string) => selectedIngredients.some(id => isCategory(id, cat as any));
    const countCat = (cat: string) => selectedIngredients.filter(id => isCategory(id, cat as any)).length;

    // Get active ingredient objects for name matching
    const activeIngredients = INGREDIENTS.filter(i => selectedIngredients.includes(i.id));

    // --- 1. FATAL CONFLICTS (Critical) ---

    // Copper Peptides + Strong Acids/Vit C
    if (has('copper_peptides') && (hasCat('Exfoliant') || has('ascorbic_acid'))) {
        activeConflicts.push({
            severity: 'Critical',
            type: 'Destabilization',
            message: 'Copper Peptides are highly unstable. Mixing with Acids or L-Ascorbic Acid can break the peptide bonds and cause pro-oxidant damage.',
            scoreImpact: -40
        });
    }

    // Benzoyl Peroxide + Retinoids (except Adapalene)
    if (has('benzoyl_peroxide') && hasCat('Retinoid') && !has('adapalene')) {
        activeConflicts.push({
            severity: 'High',
            type: 'Oxidation Alert',
            message: 'Benzoyl Peroxide generates oxygen which can degrade most Retinoids (Tretinoin/Retinol) instantly. Adapalene is the only stable exception.',
            scoreImpact: -30
        });
    }

    // Retinoid + Retinoid (Redundancy/Irritation)
    if (countCat('Retinoid') > 1) {
        activeConflicts.push({
            severity: 'High',
            type: 'Retinoid Overload',
            message: 'Using multiple Retinoids (e.g., Retinol + Tretinoin) increases irritation risk with NO added benefit. Choose one.',
            scoreImpact: -25
        });
    }

    // --- 2. HIGH RISK CONFLICTS ---

    // Exfoliant + Retinoid
    if (hasCat('Exfoliant') && hasCat('Retinoid')) {
        activeConflicts.push({
            severity: 'High',
            type: 'Barrier Risk',
            message: 'Combining Acids (AHA/BHA) with Retinoids significantly increases risk of barrier damage and sensitivity. Alternate nights.',
            scoreImpact: -20
        });
    }

    // Vitamin C (Ascorbic) + Niacinamide (Debunked but still potential flush)
    // Note: Modern research says this is mostly fine, but high heat can cause flushing. Low impact.
    if (has('ascorbic_acid') && has('niacinamide')) {
        activeConflicts.push({
            severity: 'Low',
            type: 'Sensitivity Check',
            message: 'Mixing pure L-Ascorbic Acid with Niacinamide may cause temporary flushing (redness) in sensitive skin.',
            scoreImpact: -5
        });
    }

    // --- 3. REDUNDANCY CHECKS ---

    if (countCat('Exfoliant') > 2) {
        activeConflicts.push({
            severity: 'Medium',
            type: 'Over-Exfoliation',
            message: 'You have selected more than 2 exfoliants. Be very careful to avoid stripping your moisture barrier.',
            scoreImpact: -15
        });
    }

    // --- 4. SYNERGY BONUSES (Positive Score) ---

    // Vitamin C + Vit E + Ferulic (The Golden Trio)
    if (has('ascorbic_acid') && has('vitamin_e') && has('ferulic_acid')) {
        activeConflicts.push({
            severity: 'Synergy',
            type: 'Golden Trio',
            message: 'Perfect Synergy! Vitamin E and Ferulic Acid stabilize Vitamin C and double its photoprotection capacity.',
            scoreImpact: 15
        });
    }

    // Retinoid + Niacinamide
    else if (hasCat('Retinoid') && has('niacinamide')) {
        activeConflicts.push({
            severity: 'Synergy',
            type: 'Tolerance Boost',
            message: 'Niacinamide stimulates ceramides, helping your skin tolerate Retinoids better with less irritation.',
            scoreImpact: 10
        });
    }

    // Hyaluronic Acid + Occlusive/Barrier
    if (has('hyaluronic_acid') && !hasCat('Barrier') && !hasCat('Retinoid') && !hasCat('Exfoliant')) {
        // Warning if HA is used without sealant?
        activeConflicts.push({
            severity: 'Low',
            type: 'Hydration Loss',
            message: 'Hyaluronic Acid needs a sealant (Moisturizer/Occlusive) to prevent water loss (TEWL) in dry environments.',
            scoreImpact: -5
        });
    }

    // --- SCORING CALCULATION ---

    activeConflicts.forEach(c => {
        // Impact can be positive or negative
        safetyScore += c.scoreImpact;
    });

    // 5. Phototype Calibration (Equity Adjustment)
    const weights = PHOTOTYPE_WEIGHTS[phototype] || PHOTOTYPE_WEIGHTS["I-III"];
    activeIngredients.forEach(ing => {
        // Match partial names (e.g. "Glycolic Acid 7%")
        const weightEntry = Object.entries(weights).find(([key]) => ing.name.includes(key));
        if (weightEntry) {
            const weight = weightEntry[1];
            if (weight > 1.0) {
                // E.g. 1.5 weight -> subtract 5 points for caution
                safetyScore -= (weight - 1.0) * 10;
            }
        }
    });

    // Clamp score 0-100
    const finalScore = Math.min(Math.max(safetyScore, 0), 100);

    let status: 'Optimal' | 'Caution' | 'Hazardous' = 'Optimal';
    if (finalScore <= 40) status = 'Hazardous';
    else if (finalScore <= 75) status = 'Caution';

    return {
        finalScore,
        conflicts: activeConflicts,
        status
    };
};
