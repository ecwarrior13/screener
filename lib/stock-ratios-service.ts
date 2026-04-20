import { supabaseAdmin } from "@/lib/supabase-server";

export async function getRatiosBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_ratios")
        .select("*")
        .eq("symbol", symbol)
        .order("ratio_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading ratios: ${error.message}`);
    }

    return data ?? [];
}