import { supabaseAdmin } from "@/lib/supabase-server";

export async function getSavedQuotes() {
    const { data, error } = await supabaseAdmin
        .from("fmprep_quotes")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        throw new Error(`Failed reading saved quotes: ${error.message}`);
    }

    return data ?? [];
}