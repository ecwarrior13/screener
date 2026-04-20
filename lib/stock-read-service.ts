import { supabaseAdmin } from "@/lib/supabase-server";
import { getCashFlowStatementsBySymbol } from "@/lib/stock-cash-flow-statements-service";
import { getDividendsBySymbol } from "@/lib/stock-dividends-service";
import { getIncomeStatementsBySymbol } from "@/lib/stock-income-statements-service";
import { getFinancialScoresBySymbol } from "@/lib/stock-financial-scores-service";
import { getRatiosTtmBySymbol } from "@/lib/stock-ratios-ttm-service";
import { getFinancialGrowthBySymbol } from "@/lib/stock-financial-growth-service";
import { getEarningsBySymbol } from "@/lib/stock-earnings-service";
import { getRatiosBySymbol } from "@/lib/stock-ratios-service";
export async function getStockDetailsBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [
        quoteResult,
        profileResult,
        keyMetricsResult,
        financialScores,
        ratiosTtm,
        dividends,
        cashFlowStatements,
        incomeStatements,
        ratios,
        financialGrowth,
        earnings,
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
        getCashFlowStatementsBySymbol(symbol),
        getFinancialScoresBySymbol(symbol),
        getRatiosTtmBySymbol(symbol),
        getFinancialGrowthBySymbol(symbol),
        getEarningsBySymbol(symbol),
        getRatiosBySymbol(symbol),
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
        cashFlowStatements,
        financialScores,
        ratiosTtm,
        financialGrowth,
        earnings,
        ratios,
    };
}
