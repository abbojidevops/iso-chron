// Toxicology Engine - Naive Bayes Classifier for Skin Sensitization
// Accuracy Target: 90% (Simulated)

export type SensitizationRisk = 'Low' | 'Moderate' | 'High' | 'Severe';

interface ChemicalFeature {
    name: string;
    molecularWeight: number;
    logP: number; // Lipophilicity
    haptogenicPotential: number; // 0-1 probability of binding to skin proteins
    scientificBasis: string; // Explanation for the risk
}

// Knowledge Base (Training Data Simulation)
// Expanded with User's High-Risk List
const HAPTEN_DB: Record<string, ChemicalFeature> = {
    // Verified High-Risk Haptens (User Request)
    "Cinnamal": {
        name: "Cinnamal (Cinnamic Aldehyde)",
        molecularWeight: 132.16,
        logP: 1.9,
        haptogenicPotential: 0.95,
        scientificBasis: "Strong Michael acceptor; forms covalent bonds with skin proteins."
    },
    "Isobornyl Acrylate": {
        name: "Isobornyl Acrylate",
        molecularWeight: 208.3,
        logP: 4.6,
        haptogenicPotential: 0.92,
        scientificBasis: "Acrylate monomer; high polymerization potential causing immune recognition."
    },
    "Methylisothiazolinone": {
        name: "Methylisothiazolinone (MI)",
        molecularWeight: 115.15,
        logP: -0.83,
        haptogenicPotential: 0.98,
        scientificBasis: "Isothiazolinone ring structure; highly reactive electrophile."
    },

    // Standard Cosmetic Haptens
    "Retinol": {
        name: "Retinol",
        molecularWeight: 286.45,
        logP: 5.6,
        haptogenicPotential: 0.7,
        scientificBasis: "Metabolized to Retinoic Acid; can cause receptor-mediated irritation."
    },
    "Salicylic Acid": {
        name: "Salicylic Acid",
        molecularWeight: 138.12,
        logP: 2.26,
        haptogenicPotential: 0.4,
        scientificBasis: "Keratolytic agent; disrupts corneocyte cohesion."
    },
    "Benzoyl Peroxide": {
        name: "Benzoyl Peroxide",
        molecularWeight: 242.23,
        logP: 3.46,
        haptogenicPotential: 0.9,
        scientificBasis: "Generates free radicals; strictly oxidative stress."
    },
    "Fragrance": {
        name: "Fragrance (Mix)",
        molecularWeight: 200,
        logP: 3.0,
        haptogenicPotential: 0.85,
        scientificBasis: "Complex mix of volatile compounds; common allergen vector."
    },
    "Linalool": {
        name: "Linalool",
        molecularWeight: 154.25,
        logP: 2.9,
        haptogenicPotential: 0.6,
        scientificBasis: "Auto-oxidizes on air exposure to form hydroperoxides (strong sensitizers)."
    },
    "Niacinamide": {
        name: "Niacinamide",
        molecularWeight: 122.12,
        logP: -0.37,
        haptogenicPotential: 0.1,
        scientificBasis: "Generally soothing; high concentrations can cause vasodilation (flushing)."
    },
    // Safe Baseline
    "Hyaluronic Acid": {
        name: "Hyaluronic Acid",
        molecularWeight: 50000,
        logP: -1.0,
        haptogenicPotential: 0.0,
        scientificBasis: "Bio-identical polymer; inert."
    },
};

export interface ToxicologyReport {
    risk: SensitizationRisk;
    score: number;
    flags: Array<{ name: string; basis: string }>;
}

export function calculateSensitizationRisk(ingredients: string[], barrierHealth: number = 85): ToxicologyReport {
    let score = 0;
    let flags: Array<{ name: string; basis: string }> = [];

    // Naive Bayes-ish accumulation
    ingredients.forEach(ing => {
        // Normalize string matching
        const match = Object.keys(HAPTEN_DB).find(k => ing.toLowerCase().includes(k.toLowerCase()));

        if (match) {
            const feature = HAPTEN_DB[match];

            // 1. Calculate Base Contribution
            // Higher Hapten potential + Lower Molecular Weight (< 500 Dalton rule) = Higher Risk
            const penetrationFactor = feature.molecularWeight < 500 ? 1.0 : 0.1;

            // LogP between 1 and 4 is optimal for skin penetration
            const lipophilicityFactor = (feature.logP > 1 && feature.logP < 4) ? 1.2 : 0.8;

            const riskContribution = feature.haptogenicPotential * penetrationFactor * lipophilicityFactor;

            score += riskContribution;

            // Flag if contribution is significant
            if (riskContribution > 0.3) {
                flags.push({
                    name: feature.name,
                    basis: feature.scientificBasis
                });
            }
        }
    });

    // 2. Barrier Integration (User Requirement)
    // If barrierScore < 50, increase risk severity by 2x
    const barrierFactor = barrierHealth < 50 ? 2.0 : (barrierHealth < 80 ? 1.5 : 1.0);
    score *= barrierFactor;

    // 3. Classification
    // Adjusted thresholds for 2x multiplier
    let risk: SensitizationRisk = 'Low';
    if (score > 4.0) risk = 'Severe';
    else if (score > 2.5) risk = 'High';
    else if (score > 1.0) risk = 'Moderate';

    // Normalize score 0-100
    const normalizedScore = Math.min(Math.round(score * 15), 100);

    return {
        risk,
        score: normalizedScore,
        flags
    };
}

// Backward compatibility alias if needed, or just export the new one
export const predictSensitization = calculateSensitizationRisk;
