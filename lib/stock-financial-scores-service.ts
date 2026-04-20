import { supabaseAdmin } from "@/lib/supabase-server";

export async function getFinancialScoresBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_financial_scores")
        .select("*")
        .eq("symbol", symbol)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed reading financial scores: ${error.message}`);
    }

    return data;
}