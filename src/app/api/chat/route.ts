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

        // 1. Routine Description Logic
        if (lastUserMessage.includes("what is my routine") || lastUserMessage.includes("list my ingredients") || lastUserMessage.includes("what am i using")) {
            if (actives === "None" || actives.trim() === "") {
                responseText = "Your routine is currently empty. Select some ingredients from the dashboard to begin analysis.";
            } else {
                responseText = `Your current routine consists of: ${actives}. (Safety Score: ${score}/100)`;
            }
        }

        // 2. Safety Check Logic
        else if (lastUserMessage.includes("safe") || lastUserMessage.includes("risk") || lastUserMessage.includes("bad")) {
            if (risk === "Hazardous") {
                responseText = "⚠️ I detected a conflict in your routine. You are likely mixing strong actives like Retinol and AHAs/BHAs. This can damage your skin barrier. I recommend splitting them into AM/PM routines.";
            } else if (risk === "Caution") {
                responseText = "Your routine is generally okay, but be careful. You have multiple actives that might cause irritation if used daily. improving hydration is key.";
            } else {
                responseText = "✅ Your routine looks completely safe! The synergy between your selected ingredients is optimal.";
            }
        }

        // 3. Ingredient Specific Advice
        else if (lastUserMessage.includes("retinol")) {
            responseText = "Retinol is the gold standard for anti-aging. Always use it at night 🌙 and wear SPF the next morning, as it makes your skin sun-sensitive.";
        }
        else if (lastUserMessage.includes("vitamin c")) {
            responseText = "Vitamin C is a powerful antioxidant 🍊. It works best in the morning to boost the efficacy of your sunscreen.";
        }
        else if (lastUserMessage.includes("acid") || lastUserMessage.includes("aha") || lastUserMessage.includes("bha")) {
            responseText = "Exfoliating acids (AHAs/BHAs) reveal brighter skin but can be drying. Limit use to 2-3 times a week and never mix directly with Retinol.";
        }
        else if (lastUserMessage.includes("hi") || lastUserMessage.includes("hello")) {
            responseText = `Hello! I see your current routine has a Safety Score of ${score}/100. How can I help you optimize it?`;
        }

        // 4. Fallback
        else {
            responseText = `I'm analyzing your routine (Score: ${score}). While I'm still in training, I suggest focusing on the "Conflict" tab to see specific interaction warnings.`;
        }

        return NextResponse.json({
            message: responseText
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
    }
}
