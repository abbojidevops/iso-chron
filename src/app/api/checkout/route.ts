import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get App URL dynamically from request headers
        // Priority: Origin -> Host -> VERCEL_URL -> Env Var -> Localhost
        const origin = req.headers.get("origin");
        const host = req.headers.get("host");
        const protocol = req.headers.get("x-forwarded-proto") || "https";

        let appUrl = "";

        if (origin) {
            appUrl = origin;
        } else if (host) {
            appUrl = `${protocol}://${host}`;
        } else {
            appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        }

        // Ensure scheme (redundant but safe)
        if (appUrl && !appUrl.startsWith("http")) {
            appUrl = `https://${appUrl}`;
        }

        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "ISO-CHRON Premium Audit",
                            description: "Unlock advanced chemical analysis, UV-index correlation, and routine timeline optimization.",
                        },
                        unit_amount: 4500, // $45.00
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${appUrl}/dashboard?success=true`,
            cancel_url: `${appUrl}/dashboard?canceled=true`,
            metadata: {
                userId: userId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("[STRIPE_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
