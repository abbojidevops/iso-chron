// Stability Engine - Artificial Neural Network (ANN) Simulation
// Predicts Emulsion Stability (O/W Separation)

type PhaseState = 'Stable' | 'Creaming' | 'Flocculation' | 'Phase Inversion' | 'Coalescence';

interface Surfactant {
    name: string;
    hlb: number; // Hydrophilic-Lipophilic Balance (0-20)
}

const SURFACTANTS: Record<string, Surfactant> = {
    "Stearic Acid": { name: "Stearic Acid", hlb: 15 },
    "Cetyl Alcohol": { name: "Cetyl Alcohol", hlb: 15.5 },
    "Polysorbate 20": { name: "Polysorbate 20", hlb: 16.7 },
    "Polysorbate 80": { name: "Polysorbate 80", hlb: 15.0 },
    "Lecithin": { name: "Lecithin", hlb: 4.0 }, // W/O emulsifier
    "Glyceryl Stearate": { name: "Glyceryl Stearate", hlb: 3.8 },
};

// Activation Function (Sigmoid)
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function predictStability(ingredients: string[], pH: number): { state: PhaseState; stabilityScore: number; details: string } {
    // 1. Input Layer: Identify Surfactants and calculate weighted HLB
    let totalHLB = 0;
    let count = 0;

    ingredients.forEach(ing => {
        const match = Object.keys(SURFACTANTS).find(k => ing.toLowerCase().includes(k.toLowerCase()));
        if (match) {
            totalHLB += SURFACTANTS[match].hlb;
            count++;
        }
    });

    const avgHLB = count > 0 ? totalHLB / count : 0;

    // 2. Hidden Layer: Feature Crosses
    // Stability depends on HLB matching the oil phase (assumed standard oil HLB ~10)
    // And pH compatibility

    const idealHLB = 10;
    const hlbDelta = Math.abs(avgHLB - idealHLB);

    // Artificial Neuron Weights (Simulated training)
    const w_hlb = -0.5; // Penalty for deviation
    const w_ph = -0.2;  // Penalty for extreme pH
    const bias = 5.0;   // Inherent stability bias

    const phDeviation = Math.abs(pH - 5.5); // Deviation from skin physiological pH

    // 3. Output Layer
    const logit = (hlbDelta * w_hlb) + (phDeviation * w_ph) + bias;
    const probability = sigmoid(logit); // 0-1 stability score

    const score = Math.round(probability * 100);

    // Classification Logic
    let state: PhaseState = 'Stable';
    let details = "Emulsion system is balanced.";

    if (count === 0 && ingredients.length > 0) {
        // No emulsifiers found but ingredients exist -> mixture might not separate if single phase, 
        // but for this sim we assume complex mix requires stabilization
        if (ingredients.length > 3) {
            state = 'Coalescence';
            details = "No surfactants detected in complex mixture.";
            return { state, stabilityScore: 10, details };
        }
    }

    if (score < 40) {
        state = 'Phase Inversion';
        details = "Fatal HLB mismatch. Emulsion will invert.";
    } else if (score < 60) {
        state = 'Creaming';
        details = "Stokes' Law violation probable. Droplet migration detected.";
    } else if (score < 80) {
        if (phDeviation > 2) {
            state = 'Flocculation';
            details = "pH charge imbalance causing aggregation.";
        } else {
            state = 'Stable'; // Marginal
        }
    }

    return { state, stabilityScore: score, details };
}
