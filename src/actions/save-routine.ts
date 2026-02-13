'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// We need to use the Clerk -> Supabase connection flow for Server Actions
// Since we are in a Next.js 15 Server Action, we can't use the client-side createClient directly with the user's session from the browser easily without passing the token.
// However, the user provided code uses '@/utils/supabase/server'. 
// I will adapt it to work with our existing Clerk+Supabase setup or generic Supabase client if the token is passed.

// ADAPTATION: We will accept the token as an argument or use the service role key if trusted (but RLS relies on auth.uid()).
// Actually, with Clerk, we can use `auth()` to get the userId, but to write to Supabase as that user, we need the token.
// For simplicity and to match the user's request pattern, I'll assume we pass the Auth Token or use the Service Role (ignoring RLS for the write if we trust the inputs, but better to use the token).

// Let's stick closer to the user's snippet but adapting for our setup which might not have '@/utils/supabase/server'
// We will use the generic supabase-js client and require the user to pass the token from the client for now, OR 
// use the Service Role key but manually enforce the user_id check. 

// BETTER APPROACH: Use the client-side passed token to authenticate the request.
export async function saveMolecularRoutine(token: string, formData: {
    ingredients: string[],
    safetyScore: number,
    status: string,
    toxicologyReport?: any // New field
}) {
    if (!token) return { success: false, error: "Unauthorized" };

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // 1. Manually decode JWT to get User ID (Robust method)
    // We trust that the token signature will be verified by Supabase on the subsequent request (RLS).
    let userId: string | null = null;
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.sub;
    } catch (e) {
        return { success: false, error: "Invalid Token Format" };
    }

    if (!userId) return { success: false, error: "Unauthorized User (No ID in token)" };

    // 2. Insert into Supabase (RLS will enforce permissions)
    const { data, error } = await supabase
        .from('routines')
        .insert([{
            user_id: userId, // Use extracted ID
            ingredients: formData.ingredients,
            safety_score: formData.safetyScore,
            status: formData.status,
            routine_name: `Routine Analysis - ${new Date().toLocaleTimeString()}`,
            toxicology_report: formData.toxicologyReport // Save JSON
        }])
        .select()

    if (error) {
        console.error('Error saving routine:', error.message)
        return { success: false, error: error.message }
    }

    // revalidatePath('/dashboard') // This works if we were using a server component fetching data, but we are client-fetching.
    return { success: true, data }
}
