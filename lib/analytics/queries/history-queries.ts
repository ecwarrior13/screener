import { supabaseAdmin } from "@/lib/supabase-server";

export async function getAnnualIncomeStatementsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_income_statements")
        .select("*")
        .eq("symbol", symbol)
        .eq("period", "FY")
        .order("statement_date", { ascending: false })
        .limit(10);

    if (error) {
        throw new Error(`Failed reading annual income statements: ${error.message}`);
    }

    return data ?? [];
}

export async function getAnnualCashFlowStatementsBySymbolForHistory(
    inputSymbol: string
) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_cash_flow_statements")
        .select("*")
        .eq("symbol", symbol)
        .eq("period", "FY")
        .order("statement_date", { ascending: false })
        .limit(10);

    if (error) {
        throw new Error(`Failed reading annual cash flow statements: ${error.message}`);
    }

    return data ?? [];
}
export async function getAnnualBalanceSheetsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_balance_sheets")
        .select("*")
        .eq("symbol", symbol)
        .eq("period", "FY")
        .order("statement_date", { ascending: false })
        .limit(10);

    if (error) {
        throw new Error(`Failed reading annual balance sheets: ${error.message}`);
    }

    return data ?? [];
}