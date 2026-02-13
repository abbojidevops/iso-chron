// Toxicology Engine - Naive Bayes Classifier for Skin Sensitization
// Accuracy Target: 86% (Simulated)

type SensitizationRisk = 'Low' | 'Moderate' | 'High' | 'Severe';

interface ChemicalFeature {
    name: string;
    molecularWeight: number;
    logP: number; // Lipophilicity
    haptogenicPotential: number; // 0-1 probability of binding to skin proteins
}

// Knowledge Base (Training Data Simulation)
const HAPTEN_DB: Record<string, ChemicalFeature> = {
    "Retinol": { name: "Retinol", molecularWeight: 286.45, logP: 5.6, haptogenicPotential: 0.7 },
    "Salicylic Acid": { name: "Salicylic Acid", molecularWeight: 138.12, logP: 2.26, haptogenicPotential: 0.4 },
    "Benzoyl Peroxide": { name: "Benzoyl Peroxide", molecularWeight: 242.23, logP: 3.46, haptogenicPotential: 0.9 },
    "Fragrance": { name: "Fragrance (Mix)", molecularWeight: 200, logP: 3.0, haptogenicPotential: 0.85 },
    "Linalool": { name: "Linalool", molecularWeight: 154.25, logP: 2.9, haptogenicPotential: 0.6 },
    "Niacinamide": { name: "Niacinamide", molecularWeight: 122.12, logP: -0.37, haptogenicPotential: 0.1 },
    "Hyaluronic Acid": { name: "Hyaluronic Acid", molecularWeight: 50000, logP: -1.0, haptogenicPotential: 0.0 },
};

// Prior Probabilities (Baseline risk in population)
const PRIORS = {
    Low: 0.6,
    Moderate: 0.25,
    High: 0.1,
    Severe: 0.05
};

export function predictSensitization(ingredients: string[], barrierHealth: number): { risk: SensitizationRisk; score: number; flags: string[] } {
    let score = 0;
    let flags: string[] = [];

    // Naive Bayes-ish accumulation of log-likelihoods
    // We approximate P(Risk | Ingredients) ∝ P(Ingredients | Risk) * P(Risk)

    ingredients.forEach(ing => {
        // Normalize string
        const match = Object.keys(HAPTEN_DB).find(k => ing.toLowerCase().includes(k.toLowerCase()));
        if (match) {
            const feature = HAPTEN_DB[match];

            // Calculate contribution to "High Risk" class
            // Higher Hapten potential + Lower Molecular Weight (better penetration) = Higher Risk
            const penetrationFactor = feature.molecularWeight < 500 ? 1 : 0.1;
            const lipophilicityFactor = (feature.logP > 1 && feature.logP < 4) ? 1.2 : 0.8; // Optimal range for skin absorption

            const riskContribution = feature.haptogenicPotential * penetrationFactor * lipophilicityFactor;

            score += riskContribution;

            if (riskContribution > 0.4) {
                flags.push(match);
            }
        }
    });

    // Barrier Integrity Multiplier
    // If barrier is compromised (low score), sensitivity risk doubles
    const barrierFactor = barrierHealth < 50 ? 2.0 : (barrierHealth < 80 ? 1.5 : 1.0);
    score *= barrierFactor;

    // Classification
    let risk: SensitizationRisk = 'Low';
    if (score > 3.5) risk = 'Severe';
    else if (score > 2.0) risk = 'High';
    else if (score > 0.8) risk = 'Moderate';

    return { risk, score: Math.min(score * 10, 100), flags };
}
