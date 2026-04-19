import { supabaseAdmin } from "@/lib/supabase-server";

export async function getCashFlowStatementsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const { data, error } = await supabaseAdmin
        .from("fmprep_cash_flow_statements")
        .select("*")
        .eq("symbol", symbol)
        .order("statement_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading cash flow statements: ${error.message}`);
    }

    return data ?? [];
}
