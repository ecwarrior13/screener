import { supabaseAdmin } from "@/lib/supabase-server";

export async function getRatiosTtmBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_ratios_ttm")
        .select("*")
        .eq("symbol", symbol)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed reading ratios ttm: ${error.message}`);
    }

    return data;
}