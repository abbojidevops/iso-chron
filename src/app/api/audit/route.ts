import { NextResponse } from 'next/server';
import { checkConflicts, INGREDIENTS } from '@/lib/ingredients';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ingredients } = body; // Array of IDs

        if (!ingredients || !Array.isArray(ingredients)) {
            return NextResponse.json({ error: 'Invalid ingredients list' }, { status: 400 });
        }

        const conflicts = checkConflicts(ingredients);

        return NextResponse.json({
            conflicts,
            analyzed_at: new Date().toISOString(),
            chemical_signature: "ISO-CHRON-VALIDATED"
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
