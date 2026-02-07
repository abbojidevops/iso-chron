export type ConflictResult = {
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    type: string;
    message: string;
    scoreImpact: number;
};

export const runMolecularAudit = (selectedIngredients: string[]) => {
    let safetyScore = 100;
    const activeConflicts: ConflictResult[] = [];

    // Mapping based on the compounds in your Bio-Audit UI
    // IDs must match src/lib/ingredients.ts
    const pairings = [
        {
            ids: ['retinol', 'vitamin_c'],
            severity: 'High',
            type: 'Molecular Instability',
            impact: 30,
            msg: 'pH Imbalance: Vit-C (low pH) and Retinol (high pH) neutralize each other.'
        },
        {
            ids: ['retinol', 'aha'],
            severity: 'Critical',
            type: 'Barrier Compromise',
            impact: 50,
            msg: 'Over-exfoliation: High risk of chronic inflammation and peeling.'
        },
        {
            ids: ['benzoyl_peroxide', 'retinol'],
            severity: 'Medium',
            type: 'Oxidation Alert',
            impact: 20,
            msg: 'Oxidative Stress: BPO can deactivate Retinol molecules upon contact.'
        },
        {
            ids: ['aha', 'bha'],
            severity: 'High',
            type: 'Acid Overload',
            impact: 40,
            msg: 'Double Exfoliation: Combining AHAs and BHAs can lead to severe dryness and irritation.'
        },
        {
            ids: ['vitamin_c', 'aha'],
            severity: 'High',
            type: 'Oxidation Risk',
            impact: 30,
            msg: 'AHAs can destabilize Vitamin C, reducing its antioxidant potency.'
        }
    ];

    pairings.forEach(rule => {
        if (rule.ids.every(id => selectedIngredients.includes(id))) {
            activeConflicts.push({
                severity: rule.severity as any,
                type: rule.type,
                message: rule.msg,
                scoreImpact: rule.impact
            });
            safetyScore -= rule.impact;
        }
    });

    // Clamp score at 0
    const finalScore = Math.max(safetyScore, 0);

    return {
        finalScore,
        conflicts: activeConflicts,
        status: finalScore > 70 ? 'Optimal' : finalScore > 40 ? 'Caution' : 'Hazardous'
    };
};
