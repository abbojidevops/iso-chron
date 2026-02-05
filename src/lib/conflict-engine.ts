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
    // Using snake_case IDs to match src/lib/ingredients.ts
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
        }
    ];

    pairings.forEach(rule => {
        // Check if *all* ingredients in the rule are present in the user's selection
        // Note: The user's UI sends IDs like 'Retinol', 'Vitamin C'. 
        // We need to ensure the IDs match exactly what's in the INGREDIENTS list.
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

    return {
        finalScore: Math.max(safetyScore, 0),
        conflicts: activeConflicts,
        status: safetyScore > 70 ? 'Optimal' : safetyScore > 40 ? 'Caution' : 'Hazardous'
    };
};
