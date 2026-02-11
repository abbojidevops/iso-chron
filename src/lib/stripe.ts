import Stripe from 'stripe';

// Use the specific API version required by the installed SDK
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-01-28.clover' as any, // Bypass strict type check
    typescript: true,
});
