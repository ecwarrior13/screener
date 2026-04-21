import { supabaseAdmin } from "@/lib/supabase-server";

export async function getRecentQuarterlyCashFlowStatementsBySymbol(
    inputSymbol: string
) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_cash_flow_statements")
        .select("*")
        .eq("symbol", symbol)
        .in("period", ["Q1", "Q2", "Q3", "Q4"])
        .order("statement_date", { ascending: false })
        .limit(20);

    if (error) {
        throw new Error(
            `Failed reading recent quarterly cash flow statements: ${error.message}`
        );
    }

    return data ?? [];
}

export async function getAnnualCashFlowStatementsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_cash_flow_statements")
        .select("*")
        .eq("symbol", symbol)
        .eq("period", "FY")
        .order("statement_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading annual cash flow statements: ${error.message}`);
    }

    return data ?? [];
}

export async function getLatestQuoteBySymbolForCashflow(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_quotes")
        .select("*")
        .eq("symbol", symbol)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed reading quote: ${error.message}`);
    }

    return data;
}

export async function getRecentQuarterlyIncomeStatementsForShares(
    inputSymbol: string
) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_income_statements")
        .select("*")
        .eq("symbol", symbol)
        .in("period", ["Q1", "Q2", "Q3", "Q4"])
        .order("statement_date", { ascending: false })
        .limit(4);

    if (error) {
        throw new Error(
            `Failed reading recent quarterly income statements for shares: ${error.message}`
        );
    }

    return data ?? [];
}