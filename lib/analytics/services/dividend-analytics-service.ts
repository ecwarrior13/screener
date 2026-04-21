import { calculateCagr } from "@/lib/analytics/calculations/cagr";
import {
    getDividendHistoryBySymbol,
    getLatestQuoteBySymbol,
    getRecentQuarterlyIncomeStatementsBySymbol,
} from "@/lib/analytics/queries/dividend-queries";

type AnnualDividendTotal = {
    year: number;
    totalDividend: number;
};

type DividendAnalytics = {
    symbol: string;
    currentDividend: number | null;
    dividendPerShareTtm: number | null;
    annualizedDividendEstimate: number | null;
    dividendYieldTtm: number | null;
    payoutRatioTtm: number | null;
    ttmEps: number | null;
    dividendCagr5Y: number | null;
    dividendCagr10Y: number | null;
    annualDividendTotals: AnnualDividendTotal[];
};

function buildAnnualDividendTotals(
    dividends: Array<{ dividend_date: string; dividend: number | null }>
): AnnualDividendTotal[] {
    const totalsByYear = new Map<number, number>();

    for (const item of dividends) {
        if (!item.dividend_date || item.dividend == null) continue;

        const year = new Date(item.dividend_date).getUTCFullYear();
        totalsByYear.set(year, (totalsByYear.get(year) ?? 0) + Number(item.dividend));
    }

    return Array.from(totalsByYear.entries())
        .map(([year, totalDividend]) => ({
            year,
            totalDividend,
        }))
        .sort((a, b) => b.year - a.year);
}

function getCompletedAnnualDividendTotals(
    annualTotals: AnnualDividendTotal[]
): AnnualDividendTotal[] {
    const currentYear = new Date().getUTCFullYear();

    return annualTotals.filter((item) => item.year < currentYear);
}

function getCagrFromCompletedAnnualTotals(
    annualTotals: AnnualDividendTotal[],
    years: number
): number | null {
    const completedTotals = getCompletedAnnualDividendTotals(annualTotals);

    if (!completedTotals.length) return null;

    const end = completedTotals[0];
    const startYear = end.year - years;
    const start = completedTotals.find((item) => item.year === startYear);

    if (!start) {
        return null;
    }

    return calculateCagr(start.totalDividend, end.totalDividend, years);
}

function calculateTtmEps(
    incomeStatements: Array<{ eps: number | null }>
): number | null {
    if (incomeStatements.length < 4) {
        return null;
    }

    const total = incomeStatements.slice(0, 4).reduce((sum, item) => {
        return sum + Number(item.eps ?? 0);
    }, 0);

    return total > 0 ? total : null;
}

function calculateDividendPerShareTtm(
    dividends: Array<{ dividend: number | null }>
): number | null {
    if (dividends.length < 4) {
        return null;
    }

    const total = dividends.slice(0, 4).reduce((sum, item) => {
        return sum + Number(item.dividend ?? 0);
    }, 0);

    return total > 0 ? total : null;
}

function estimateAnnualizedDividend(
    dividends: Array<{ dividend: number | null }>
): number | null {
    if (!dividends.length) return null;

    const latestDividend = dividends[0]?.dividend ?? null;
    if (latestDividend == null) return null;

    return Number(latestDividend) * 4;
}
export async function buildDividendAnalytics(
    inputSymbol: string
): Promise<DividendAnalytics> {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [dividends, quote, recentQuarterlyIncomeStatements] =
        await Promise.all([
            getDividendHistoryBySymbol(symbol),
            getLatestQuoteBySymbol(symbol),
            getRecentQuarterlyIncomeStatementsBySymbol(symbol),
        ]);

    const annualDividendTotals = buildAnnualDividendTotals(dividends);

    const currentDividend =
        dividends.length > 0 ? Number(dividends[0].dividend ?? null) : null;

    const dividendPerShareTtm = calculateDividendPerShareTtm(dividends);
    const annualizedDividendEstimate = estimateAnnualizedDividend(dividends);

    const price = quote?.price != null ? Number(quote.price) : null;

    const dividendYieldTtm =
        dividendPerShareTtm != null && price != null && price > 0
            ? dividendPerShareTtm / price
            : null;

    const ttmEps = calculateTtmEps(recentQuarterlyIncomeStatements);

    const payoutRatioTtm =
        dividendPerShareTtm != null && ttmEps != null && ttmEps > 0
            ? dividendPerShareTtm / ttmEps
            : null;

    const dividendCagr5Y = getCagrFromCompletedAnnualTotals(
        annualDividendTotals,
        5
    );
    const dividendCagr10Y = getCagrFromCompletedAnnualTotals(
        annualDividendTotals,
        10
    );

    return {
        symbol,
        currentDividend,
        dividendPerShareTtm,
        annualizedDividendEstimate,
        dividendYieldTtm,
        payoutRatioTtm,
        ttmEps,
        dividendCagr5Y,
        dividendCagr10Y,
        annualDividendTotals,
    };
}