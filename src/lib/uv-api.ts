export async function getLocalUVIndex(lat: number, lon: number): Promise<number | null> {
    try {
        const res = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=uv_index`
        );

        if (!res.ok) throw new Error("Weather API Error");

        const data = await res.json();
        return data.current?.uv_index || null;
    } catch (error) {
        console.error("Failed to fetch UV Index:", error);
        return null;
    }
}

export function isSunSafe(uvIndex: number, ingredients: string[]): { safe: boolean; reason?: string } {
    // Photosensitive ingredients
    const sensitive = ['retinol', 'aha', 'bha', 'benzoyl_peroxide'];
    const hasSensitive = ingredients.some(id => sensitive.includes(id));

    // Simple rule: If UV > 5 and sensitive ingredients selected (without explicit SPF check for now)
    // In a real app, we'd check for 'spf' ingredient presence.
    if (uvIndex > 5 && hasSensitive) {
        return {
            safe: false,
            reason: `High UV Index (${uvIndex}). Acids/Retinols increase sun sensitivity. Apply SPF 50+ or move these to PM.`
        };
    }

    return { safe: true };
}
