import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic'; // Prevent static analysis/prerendering


export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("CRITICAL: STRIPE_SECRET_KEY is missing in environment variables.");
            return NextResponse.json({ error: "Server Error: Stripe Secret Key is missing. Please add it to Vercel Env Vars." }, { status: 500 });
        }

        // Parse request body for planType
        const body = await req.json();
        const planType = body.planType || 'full'; // Default to 'full'

        // Get App URL dynamically from request headers
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

        // Ensure scheme
        if (appUrl && !appUrl.startsWith("http")) {
            appUrl = `https://${appUrl}`;
        }

        // Define pricing tiers
        const pricingConfig = {
            full: {
                name: 'Full Molecular Audit',
                description: 'Professional chemical conflict analysis and routine optimization.',
                amount: 4500, // $45.00
                mode: 'payment' as const
            },
            monthly: {
                name: 'ISO-CHRON Monthly Sync',
                description: 'Unlimited audits + priority support.',
                amount: 999, // $9.99/month
                mode: 'subscription' as const
            }
        };

        const config = pricingConfig[planType as keyof typeof pricingConfig] || pricingConfig.full;

        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: config.name,
                            description: config.description,
                        },
                        unit_amount: config.amount,
                        ...(config.mode === 'subscription' && {
                            recurring: { interval: 'month' }
                        })
                    },
                    quantity: 1,
                },
            ],
            mode: config.mode,
            success_url: `${appUrl}/dashboard?success=true`,
            cancel_url: `${appUrl}/dashboard?canceled=true`,
            metadata: {
                userId: userId,
                planType: planType
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("[STRIPE_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
