import { supabaseAdmin } from "@/lib/supabase-server";

export async function getDividendsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_dividends")
        .select("*")
        .eq("symbol", symbol)
        .order("dividend_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading dividends: ${error.message}`);
    }

    return data ?? [];
}