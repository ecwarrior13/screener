import { buildCashflowAnalytics } from "@/lib/analytics/services/cashflow-analytics-service";
import { buildDividendAnalytics } from "@/lib/analytics/services/dividend-analytics-service";
import { buildHistoryAnalytics } from "@/lib/analytics/services/history-analytics-service";

type UnifiedAnalytics = {
    symbol: string;
    dividendAnalytics: Awaited<ReturnType<typeof buildDividendAnalytics>>;
    cashflowAnalytics: Awaited<ReturnType<typeof buildCashflowAnalytics>>;
    historyAnalytics: Awaited<ReturnType<typeof buildHistoryAnalytics>>;
};

export async function buildUnifiedAnalytics(
    inputSymbol: string
): Promise<UnifiedAnalytics> {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [dividendAnalytics, cashflowAnalytics, historyAnalytics] =
        await Promise.all([
            buildDividendAnalytics(symbol),
            buildCashflowAnalytics(symbol),
            buildHistoryAnalytics(symbol),
        ]);

    return {
        symbol,
        dividendAnalytics,
        cashflowAnalytics,
        historyAnalytics,
    };
}