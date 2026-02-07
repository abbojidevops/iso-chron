import { createClient } from "@supabase/supabase-js";
import { Ingredient } from "./ingredients";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchIngredients(): Promise<Ingredient[]> {
    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

    if (error) {
        console.error("Error fetching ingredients:", error);
        return [];
    }

    return data as Ingredient[];
}

export type Product = {
    id: string;
    name: string;
    brand: string;
    // We will expand this later to include ingredients
};

// Placeholder for future Product fetching
export async function fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) return [];
    return data as Product[];
}
