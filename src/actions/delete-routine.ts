'use server'

import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'

export async function deleteRoutine(routineId: string) {
    const { userId, getToken } = auth();

    if (!userId) return { success: false, error: "Unauthorized" };

    const token = await getToken({ template: 'supabase' });

    if (!token) return { success: false, error: "No Supabase Token" };

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // RLS will ensure the user can only delete their own routine
    const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId)
        .eq('user_id', userId); // Double check, though RLS handles it

    if (error) {
        console.error("Error deleting routine:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
