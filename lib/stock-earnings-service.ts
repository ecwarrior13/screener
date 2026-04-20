import { supabaseAdmin } from "@/lib/supabase-server";

export async function getEarningsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_earnings")
        .select("*")
        .eq("symbol", symbol)
        .order("earnings_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading earnings: ${error.message}`);
    }

    return data ?? [];
}