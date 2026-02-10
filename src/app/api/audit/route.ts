import { NextResponse } from 'next/server';
import { runMolecularAudit } from '@/lib/conflict-engine';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ingredients } = body; // Array of IDs

        if (!ingredients || !Array.isArray(ingredients)) {
            return NextResponse.json({ error: 'Invalid ingredients list' }, { status: 400 });
        }

        const auditResult = runMolecularAudit(ingredients);

        return NextResponse.json({
            conflicts: auditResult.conflicts,
            safetyScore: auditResult.finalScore,
            status: auditResult.status,
            analyzed_at: new Date().toISOString(),
            chemical_signature: "ISO-CHRON-VALIDATED"
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
