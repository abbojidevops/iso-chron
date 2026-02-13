import { createWorker } from 'tesseract.js';
import { INGREDIENTS, Ingredient } from './ingredients';

export type ScanResult = {
    foundIngredients: Ingredient[];
    rawText: string;
    confidence: number;
};

// Normalize text for matching (remove punctuation, lower case)
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');

// List of aliases to help matching (can be expanded)
const ALIASES: Record<string, string[]> = {
    // Retinoids
    'tretinoin': ['retin-a', 'atralin', 'renova', 'tretin'],
    'adapalene': ['differin', 'epiduo'],
    'retinol': ['retinyl palmitate', 'retinyl acetate', 'retinyl linoleate', 'pure retinol'],
    'retinaldehyde': ['retinal', 'retin-aldehyde'],
    'bakuchiol': ['babchi', 'psoralea corylifolia'],

    // Acids
    'glycolic_acid': ['hydroxyacetic acid'],
    'lactic_acid': ['lactate', 'milk acid'],
    'salicylic_acid': ['beta hydroxy acid', 'willow bark', 'betaine salicylate'],
    'pha': ['gluconolactone', 'lactobionic acid', 'galactose'],
    'azelaic_acid': ['azelaic', 'finacea', 'azelex'],

    // Antioxidants
    'ascorbic_acid': ['l-ascorbic', 'pure vitamin c'],
    'vitamin_c_derivative': ['sodium ascorbyl phosphate', 'magnesium ascorbyl phosphate', 'tetrahexyldecyl ascorbate', 'thd ascorbate', 'ethylated ascorbic acid', 'sap', 'map'],
    'ferulic_acid': ['ferulic'],
    'vitamin_e': ['tocopherol', 'tocopheryl acetate'],
    'resveratrol': ['grape seed extract', 'polygonum cuspidatum'],
    'niacinamide': ['nicotinamide', 'vitamin b3'],
    'green_tea': ['camellia sinensis', 'green tea polyphenols', 'egcg'],

    // Peptides
    'copper_peptides': ['ghk-cu', 'copper tripeptide-1', 'copper tripeptide'],
    'matrixyl': ['palmitoyl pentapeptide-4', 'palmitoyl tetrapeptide-7', 'palmitoyl tripeptide-1', 'matrixyl 3000'],
    'argireline': ['acetyl hexapeptide-8', 'acetyl hexapeptide-3'],
    'egf': ['sh-oligopeptide-1', 'epidermal growth factor', 'rh-oligopeptide-1'],

    // Barrier / Hydration
    'ceramides': ['ceramide np', 'ceramide ap', 'ceramide eop', 'phytosphingosine'],
    'panthenol': ['provitamin b5', 'd-panthenol'],
    'centella': ['cica', 'centella asiatica', 'madecassoside', 'asiaticoside', 'tiger grass'],
    'hyaluronic_acid': ['sodium hyaluronate', 'hydrolyzed hyaluronic acid', 'ha'],
    'snail_mucin': ['snail secretion filtrate'],
    'polyglutamic_acid': ['pga'],

    // Brighteners
    'alpha_arbutin': ['arbutin'],
    'kojic_acid': ['kojic'],
    'tranexamic_acid': ['txa', 'trans-4-aminomethyl-cyclohexanecarboxylic acid'], // lol
    'licorice_root': ['glycyrrhiza glabra', 'dipotassium glycyrrhizate'],
    'hydroquinone': ['1,4-benzenediol'],

    // Others
    'benzoyl_peroxide': ['bpo'],
    'spf_mineral': ['zinc oxide', 'titanium dioxide'],
    'spf_chemical': ['avobenzone', 'octinoxate', 'oxybenzone', 'homosalate', 'octisalate', 'octocrylene'],

    // User Requested Additions
    'papaya_enzyme': ['papaya', 'papain', 'carica papaya'],
    'activated_charcoal': ['charcoal', 'carbon', 'activated carbon', 'detox']
};

export async function scanImage(imageFile: File | string): Promise<ScanResult> {
    const worker = await createWorker('eng');

    try {
        const ret = await worker.recognize(imageFile);
        const rawText = ret.data.text;
        const normalizedText = normalize(rawText);

        await worker.terminate();

        const found: Ingredient[] = [];

        INGREDIENTS.forEach(ing => {
            // Check main ID and Name
            const simpleName = normalize(ing.name);
            const id = ing.id;

            // Check Aliases
            const matchers = [simpleName, ... (ALIASES[id] || [])];

            // If any alias is present in the text
            if (matchers.some(term => normalizedText.includes(term))) {
                found.push(ing);
            }
        });

        // Filter duplicates just in case
        const uniqueFound = Array.from(new Set(found.map(f => f.id)))
            .map(id => INGREDIENTS.find(i => i.id === id)!);

        return {
            foundIngredients: uniqueFound,
            rawText: ret.data.text,
            confidence: ret.data.confidence
        };

    } catch (error) {
        console.error("OCR Error:", error);
        await worker.terminate();
        throw new Error("Failed to scan image.");
    }
}
