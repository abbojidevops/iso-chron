export type Ingredient = {
    id: string;
    name: string;
    category: 'Retinoid' | 'Exfoliant' | 'Antioxidant' | 'Peptide' | 'Barrier' | 'Hydrator' | 'Antibacterial' | 'Brightener' | 'Sunscreen' | 'Other';
    description?: string;
};

export const INGREDIENTS: Ingredient[] = [
    // --- RETINOIDS (Vitamin A) ---
    { id: "tretinoin", name: "Tretinoin (Retin-A)", category: "Retinoid" },
    { id: "adapalene", name: "Adapalene", category: "Retinoid" },
    { id: "retinol", name: "Retinol", category: "Retinoid" },
    { id: "retinaldehyde", name: "Retinaldehyde", category: "Retinoid" },
    { id: "bakuchiol", name: "Bakuchiol", category: "Retinoid" }, // Functional alternative

    // --- EXFOLIANTS (Acids) ---
    { id: "glycolic_acid", name: "Glycolic Acid (AHA)", category: "Exfoliant" },
    { id: "lactic_acid", name: "Lactic Acid (AHA)", category: "Exfoliant" },
    { id: "mandelic_acid", name: "Mandelic Acid (AHA)", category: "Exfoliant" },
    { id: "salicylic_acid", name: "Salicylic Acid (BHA)", category: "Exfoliant" },
    { id: "pha", name: "Gluconolactone (PHA)", category: "Exfoliant" },
    { id: "azelaic_acid", name: "Azelaic Acid", category: "Exfoliant" }, // Can also be Brightener/Antibacterial
    { id: "papaya_enzyme", name: "Papaya Enzyme (Papain)", category: "Exfoliant" },

    // --- ANTIOXIDANTS ---
    { id: "ascorbic_acid", name: "L-Ascorbic Acid (Vit C)", category: "Antioxidant" },
    { id: "vitamin_c_derivative", name: "Vitamin C Derivative", category: "Antioxidant" },
    { id: "ferulic_acid", name: "Ferulic Acid", category: "Antioxidant" },
    { id: "vitamin_e", name: "Vitamin E (Tocopherol)", category: "Antioxidant" },
    { id: "resveratrol", name: "Resveratrol", category: "Antioxidant" },
    { id: "niacinamide", name: "Niacinamide (Vit B3)", category: "Antioxidant" }, // Multi-functional
    { id: "green_tea", name: "Green Tea Extract", category: "Antioxidant" },

    // --- PEPTIDES ---
    { id: "copper_peptides", name: "Copper Peptides", category: "Peptide" },
    { id: "matrixyl", name: "Matrixyl 3000", category: "Peptide" },
    { id: "argireline", name: "Argireline", category: "Peptide" },
    { id: "egf", name: "Epidermal Growth Factor", category: "Peptide" },

    // --- BARRIER & REPAIR ---
    { id: "ceramides", name: "Ceramides", category: "Barrier" },
    { id: "panthenol", name: "Panthenol (Vit B5)", category: "Barrier" },
    { id: "centella", name: "Centella Asiatica", category: "Barrier" },
    { id: "cholesterol", name: "Cholesterol", category: "Barrier" },
    { id: "allantoin", name: "Allantoin", category: "Barrier" },

    // --- HYDRATORS ---
    { id: "hyaluronic_acid", name: "Hyaluronic Acid", category: "Hydrator" },
    { id: "glycerin", name: "Glycerin", category: "Hydrator" },
    { id: "snail_mucin", name: "Snail Mucin", category: "Hydrator" },
    { id: "polyglutamic_acid", name: "Polyglutamic Acid", category: "Hydrator" },

    // --- BRIGHTENERS ---
    { id: "alpha_arbutin", name: "Alpha Arbutin", category: "Brightener" },
    { id: "kojic_acid", name: "Kojic Acid", category: "Brightener" },
    { id: "tranexamic_acid", name: "Tranexamic Acid", category: "Brightener" },
    { id: "licorice_root", name: "Licorice Root", category: "Brightener" },
    { id: "hydroquinone", name: "Hydroquinone", category: "Brightener" },

    // --- ANTIBACTERIAL / ACNE ---
    { id: "benzoyl_peroxide", name: "Benzoyl Peroxide", category: "Antibacterial" },
    { id: "sulfur", name: "Sulfur", category: "Antibacterial" },
    { id: "tea_tree", name: "Tea Tree Oil", category: "Antibacterial" },
    { id: "activated_charcoal", name: "Activated Charcoal", category: "Antibacterial" },

    // --- SUNSCREEN ---
    { id: "spf_mineral", name: "Zinc Oxide / Titanium Dioxide", category: "Sunscreen" },
    { id: "spf_chemical", name: "Chemical Sunscreen Filters", category: "Sunscreen" },
];

// Helper to check category
export const isCategory = (id: string, cat: Ingredient['category']) => {
    return INGREDIENTS.find(i => i.id === id)?.category === cat;
};
