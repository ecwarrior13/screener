import { supabaseAdmin } from "@/lib/supabase-server";

export async function getFinancialGrowthBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_financial_growth")
        .select("*")
        .eq("symbol", symbol)
        .order("growth_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading financial growth: ${error.message}`);
    }

    return data ?? [];
}