// Microbiome & Neuro-Cosmetic Tracker
// Tracks Barrier Function and Commensal Bacteria Health

type FloraStatus = 'Dysbiotic' | 'Balanced' | 'Diverse';

export interface MicrobiomeMetrics {
    barrierIntegrity: number; // 0-100
    floraDiversity: number;   // 0-1.0 Shannon Index equivalent
    hydrationSignature: number; // 0-100
    dominantStrain: string;   // e.g., "S. epidermidis"
}

// Ingredients that affect microbiome
const PREBIOTICS = ["Inulin", "Oat Beta Glucan", "Saccharide Isomerate"];
const POSTBIOTICS = ["Lactobacillus Ferment", "Bifida Ferment Lysate"];
const DISRUPTORS = ["Benzoyl Peroxide", "SLS", "High Alcohol"]; // Sodium Lauryl Sulfate

export function analyzeMicrobiome(ingredients: string[], routineHistory: any[]): { status: FloraStatus; metrics: MicrobiomeMetrics } {
    let diversityScore = 0.8; // Baseline
    let barrierScore = 85;

    // 1. Ingredient Impact Analysis
    ingredients.forEach(ing => {
        if (PREBIOTICS.some(p => ing.includes(p))) {
            diversityScore += 0.05;
            barrierScore += 2;
        }
        if (POSTBIOTICS.some(p => ing.includes(p))) {
            diversityScore += 0.03;
            barrierScore += 3;
        }
        if (DISRUPTORS.some(d => ing.includes(d))) {
            diversityScore -= 0.15; // Major hit
            barrierScore -= 5;
        }
    });

    // 2. Cap Values
    diversityScore = Math.min(Math.max(diversityScore, 0), 1);
    barrierScore = Math.min(Math.max(barrierScore, 0), 100);

    // 3. Classification
    let status: FloraStatus = 'Balanced';
    if (diversityScore < 0.5) status = 'Dysbiotic';
    else if (diversityScore > 0.9) status = 'Diverse';

    // 4. Neuro-Cosmetic Signature (Hydration)
    // Simplified: Barrier health correlates with hydration
    const hydration = barrierScore * 1.1 > 100 ? 100 : barrierScore * 1.1;

    return {
        status,
        metrics: {
            barrierIntegrity: Math.round(barrierScore),
            floraDiversity: parseFloat(diversityScore.toFixed(2)),
            hydrationSignature: Math.round(hydration),
            dominantStrain: diversityScore > 0.7 ? "S. epidermidis (Healthy)" : "C. acnes (Opportunistic)"
        }
    };
}
