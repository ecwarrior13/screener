import { supabaseAdmin } from "@/lib/supabase-server";

export async function getDividendHistoryBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    const { data, error } = await supabaseAdmin
        .from("fmprep_dividends")
        .select("*")
        .eq("symbol", symbol)
        .order("dividend_date", { ascending: false });

    if (error) {
        throw new Error(`Failed reading dividend history: ${error.message}`);
    }

    return data ?? [];
}

export async function getLatestQuoteBySymbol(inputSymbol: string) {
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

export async function getRecentQuarterlyIncomeStatementsBySymbol(
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
            `Failed reading recent quarterly income statements: ${error.message}`
        );
    }

    return data ?? [];
}