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
    'retinol': ['retinyl', 'retinoic', 'vitamin a'],
    'vitamin_c': ['ascorbic acid', 'l-ascorbic', 'magnesium ascorbyl phosphate', 'tetrahexyldecyl ascorbate'],
    'aha': ['glycolic acid', 'lactic acid', 'mandelic acid', 'citric acid'],
    'bha': ['salicylic acid', 'betaine salicylate', 'willow bark'],
    'niacinamide': ['nicotinamide', 'vitamin b3'],
    'benzoyl_peroxide': ['benzoyl']
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

        return {
            foundIngredients: found,
            rawText: ret.data.text,
            confidence: ret.data.confidence
        };

    } catch (error) {
        console.error("OCR Error:", error);
        await worker.terminate();
        throw new Error("Failed to scan image.");
    }
}
