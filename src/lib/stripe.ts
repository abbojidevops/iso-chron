import Stripe from 'stripe';

// Use the specific API version required by the installed SDK
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia', // Trusting the error message literal from previous failure
    typescript: true,
});
