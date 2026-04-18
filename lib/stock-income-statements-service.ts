import { supabaseAdmin } from "@/lib/supabase-server";

export async function getIncomeStatementsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_income_statements")
        .select("*")
        .eq("symbol", symbol)
        .order("statement_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading income statements: ${error.message}`);
    }

    return data ?? [];
}