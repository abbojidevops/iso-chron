import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();
        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

        // Parse Context
        // specialized regex to extract score and risk
        const scoreMatch = context.match(/Score: (\d+)/);
        const riskMatch = context.match(/Risk: (\w+)/);
        const activesMatch = context.match(/Actives: (.*)/); // Capture everything after "Actives: "

        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const risk = riskMatch ? riskMatch[1] : "Unknown";
        const actives = activesMatch ? activesMatch[1] : "None";

        let responseText = "";

        // Helper for keyword matching
        const has = (keywords: string[]) => keywords.some(k => lastUserMessage.includes(k));

        // 1. Routine Description Logic ("what is my routine")
        // Relaxed matching: looks for "routine", "list", "ingredients"
        if (has(["routine", "list", "what is", "using", "ingredients"])) {
            if (actives === "None" || actives.trim() === "") {
                responseText = "Your routine is currently empty. Select some ingredients from the dashboard to begin analysis.";
            } else {
                responseText = `🧪 **Current Routine Protocol:**\n\n**Ingredients:** ${actives}\n**Safety Score:** ${score}/100\n**Risk Level:** ${risk}`;
            }
        }

        // 2. Score & Reasoning Logic ("why", "score", "low", "bad")
        else if (has(["why", "score", "rating", "evaluate", "assess"])) {
            responseText = `📊 **Score Analysis: ${score}/100**\n\n`;
            if (score === 100) {
                responseText += "Perfection. Your routine is optimally balanced with no conflicting actives.";
            } else if (score >= 80) {
                responseText += "High Score. You have a solid routine. Minor deductions may be due to the sheer number of actives, but no conflicts.";
            } else if (score >= 50) {
                responseText += "Moderate Score. Your routine has potential irritants. If you have sensitive skin, consider cycling your actives (Skin Cycling).";
            } else {
                responseText += "Low Score. Major conflicts detected (e.g., Mixing Acids + Retinol). This will damage your moisture barrier. Please remove conflicting items.";
            }
        }

        // 3. Improvement / Help Logic ("improve", "fix", "better", "help")
        else if (has(["improve", "fix", "better", "help", "recommend"])) {
            responseText = "💡 **Dr. ISO's Recommendations:**\n\n";
            if (risk === "Hazardous") {
                responseText += "1. **IMMEDIATE ACTION:** Stop using Retinol and Acids together.\n2. Use Retinol only at night.\n3. Use Acids (AHA/BHA) on alternate nights or mornings.";
            } else if (risk === "Caution") {
                responseText += "1. **Hydration First:** Add Hyaluronic Acid or a rich moisturizer to buffer these actives.\n2. **Patch Test:** Introduce new products slowly.";
            } else {
                responseText += "Your routine is already solid! To level up, ensure you are wearing SPF 50 daily to protect your results.";
            }
        }

        // 2. Analysis / Details Logic ("analyze", "details", "explain")
        else if (has(["analy", "detail", "explain", "review", "breakdown"])) {
            responseText = `🔬 **Molecular Analysis Report**\n\n`;
            responseText += `**Score:** ${score}/100 (${risk})\n\n`;

            if (risk === "Hazardous") {
                responseText += "⚠️ **CRITICAL WARNING:** Your routine contains conflicting actives (likely Retinol + Acids). This significantly compromises barrier integrity. Immediate separation into AM/PM routines is required.";
            } else if (risk === "Caution") {
                responseText += "⚠️ **Caution Advised:** You are stacking multiple strong actives. While not strictly prohibited, this raises the risk of irritation. Ensure you are hydrating heavily.";
            } else if (score >= 90) {
                responseText += "✅ **Excellent:** This is a chemically balanced routine. Your actives work synergistically without overwhelming the skin barrier.";
            } else {
                responseText += "ℹ️ **Status:** Your routine is functional but could be optimized. Check the 'Conflict' tab for specific molecular interaction notes.";
            }
        }

        // 3. Safety Check Logic
        else if (has(["safe", "risk", "bad", "danger"])) {
            if (risk === "Hazardous") {
                responseText = "⚠️ **UNSAFE:** detected a high-risk conflict. You are mixing ingredients that neutralize each other or cause damage (e.g., Retinol + AHA).";
            } else if (risk === "Caution") {
                responseText = "⚠️ **MODERATE RISK:** Your routine is aggressive. Monitor your skin for redness or peeling.";
            } else {
                responseText = "✅ **SAFE:** No known hazardous interactions detected.";
            }
        }

        // 4. Ingredient Specific Advice
        else if (lastUserMessage.includes("retinol")) {
            responseText = "Retinol is the gold standard for anti-aging. Always use it at night 🌙 and wear SPF the next morning, as it makes your skin sun-sensitive.";
        }
        else if (lastUserMessage.includes("vitamin c")) {
            responseText = "Vitamin C is a powerful antioxidant 🍊. It works best in the morning to boost the efficacy of your sunscreen.";
        }
        else if (has(["acid", "aha", "bha", "salicylic", "glycolic"])) {
            responseText = "Exfoliating acids (AHAs/BHAs) reveal brighter skin but can be drying. Limit use to 2-3 times a week and never mix directly with Retinol.";
        }
        else if (has(["niacinamide"])) {
            responseText = "Niacinamide is a versatile team player! It strengthens the barrier and regulates oil. It generally plays well with almost everything.";
        }
        else if (has(["hi", "hello", "hey"])) {
            responseText = `Hello! I'm Dr. ISO. I've analyzed your routine (Score: ${score}/100). Ask me to **"analyze my routine"** or **"list ingredients"** for details.`;
        }

        // 5. Fallback
        else {
            responseText = `I'm analyzing your routine (Score: ${score}). Try asking me to **"list my routine"** or **"explain the risks"**.`;
        }

        return NextResponse.json({
            message: responseText
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
    }
}
