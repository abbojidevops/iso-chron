export type Ingredient = {
    id: string;
    name: string;
    category: string;
};

export type Conflict = {
    ingredientA: string;
    ingredientB: string;
    severity: "High" | "Medium" | "Low";
    reason: string;
};

export const INGREDIENTS: Ingredient[] = [
    { id: "retinol", name: "Retinol", category: "Active" },
    { id: "vitamin_c", name: "Vitamin C", category: "Antioxidant" },
    { id: "aha", name: "AHA (Glycolic/Lactic Acid)", category: "Exfoliant" },
    { id: "bha", name: "BHA (Salicylic Acid)", category: "Exfoliant" },
    { id: "niacinamide", name: "Niacinamide", category: "Vitamin" },
    { id: "benzoyl_peroxide", name: "Benzoyl Peroxide", category: "Antibacterial" },
];

export const CONFLICTS: Conflict[] = [
    {
        ingredientA: "retinol",
        ingredientB: "vitamin_c",
        severity: "High",
        reason: "Using Retinol and Vitamin C together can cause significant irritation and destabilize the pH balance required for absorption.",
    },
    {
        ingredientA: "retinol",
        ingredientB: "aha",
        severity: "Medium",
        reason: "Both are exfoliants/accelerators of cell turnover. Using them together increases risk of barrier damage.",
    },
    {
        ingredientA: "retinol",
        ingredientB: "bha",
        severity: "Medium",
        reason: "Potential for over-drying and irritation.",
    },
    {
        ingredientA: "vitamin_c",
        ingredientB: "aha",
        severity: "High",
        reason: "AHAs oxidize Vitamin C, rendering it ineffective.",
    },
    {
        ingredientA: "benzoyl_peroxide",
        ingredientB: "retinol",
        severity: "High",
        reason: "Benzoyl Peroxide oxidizes Retinol, making them both less effective and highly irritating.",
    }
];

export function checkConflicts(selectedIngredients: string[]): Conflict[] {
    const foundConflicts: Conflict[] = [];

    for (let i = 0; i < selectedIngredients.length; i++) {
        for (let j = i + 1; j < selectedIngredients.length; j++) {
            const a = selectedIngredients[i];
            const b = selectedIngredients[j];

            const conflict = CONFLICTS.find(
                (c) =>
                    (c.ingredientA === a && c.ingredientB === b) ||
                    (c.ingredientA === b && c.ingredientB === a)
            );

            if (conflict) {
                foundConflicts.push(conflict);
            }
        }
    }

    return foundConflicts;
}
