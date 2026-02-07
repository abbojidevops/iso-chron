import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const userId = session.metadata?.userId;

        if (userId) {
            // ERROR: Using ANON key fails due to RLS.
            // FIX: Use SERVICE_ROLE_KEY to bypass RLS for admin writes.
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

            if (!supabaseServiceKey) {
                console.error("CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY. Premium status update failed.");
                return new NextResponse("Server Configuration Error", { status: 500 });
            }

            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            // Payload
            const profileData = {
                user_id: userId,
                is_premium: true,
                email: session.customer_details?.email || undefined,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'user_id' });

            if (error) {
                console.error("Supabase Write Error:", error);
                // If this fails due to RLS (likely), we might resort to a backup plan:
                // For the MVP, we might rely on the client-side 'success=true' to trigger a client-side write 
                // IF the webhook fails. But let's try this first.
            } else {
                console.log(`User ${userId} upgraded to Premium in DB.`);
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
