import { supabaseAdmin } from "@/lib/supabase-server";
import { getDividendsBySymbol } from "@/lib/stock-dividends-service";
import { getIncomeStatementsBySymbol } from "@/lib/stock-income-statements-service";

export async function getStockDetailsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [
        quoteResult,
        profileResult,
        keyMetricsResult,
        dividends,
        incomeStatements,
    ] = await Promise.all([
        supabaseAdmin
            .from("fmprep_quotes")
            .select("*")
            .eq("symbol", symbol)
            .maybeSingle(),

        supabaseAdmin
            .from("fmprep_profiles")
            .select("*")
            .eq("symbol", symbol)
            .maybeSingle(),

        supabaseAdmin
            .from("fmprep_key_metrics")
            .select("*")
            .eq("symbol", symbol)
            .maybeSingle(),

        getDividendsBySymbol(symbol),
        getIncomeStatementsBySymbol(symbol),
    ]);

    if (quoteResult.error) {
        throw new Error(`Failed reading quote: ${quoteResult.error.message}`);
    }

    if (profileResult.error) {
        throw new Error(`Failed reading profile: ${profileResult.error.message}`);
    }

    if (keyMetricsResult.error) {
        throw new Error(
            `Failed reading key metrics: ${keyMetricsResult.error.message}`
        );
    }

    if (!quoteResult.data) {
        throw new Error(`No saved quote found for ${symbol}`);
    }

    return {
        symbol,
        quote: quoteResult.data,
        profile: profileResult.data,
        keyMetrics: keyMetricsResult.data,
        dividends,
        incomeStatements,
    };
}