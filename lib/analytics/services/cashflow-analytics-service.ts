import { calculateCagr } from "@/lib/analytics/calculations/cagr";
import { sumLastNValues } from "@/lib/analytics/calculations/ttm";
import {
    getAnnualCashFlowStatementsBySymbol,
    getLatestQuoteBySymbolForCashflow,
    getRecentQuarterlyCashFlowStatementsBySymbol,
    getRecentQuarterlyIncomeStatementsForShares,
} from "@/lib/analytics/queries/cashflow-queries";

type AnnualFreeCashFlowTotal = {
    year: number;
    freeCashFlow: number;
};

type CashflowAnalytics = {
    symbol: string;
    freeCashFlowTtm: number | null;
    sharesOutstandingCurrent: number | null;
    freeCashFlowPerShareTtm: number | null;
    marketCap: number | null;
    freeCashFlowYield: number | null;
    freeCashFlowCagr5Y: number | null;
    freeCashFlowCagr10Y: number | null;
    annualFreeCashFlowTotals: AnnualFreeCashFlowTotal[];
};

function getSharesOutstandingFromIncomeRow(row: Record<string, unknown>): number | null {
    const possibleKeys = [
        "weighted_average_shs_out",
        "weighted_average_shs_out_dil",
        "weightedAverageShsOut",
        "weightedAverageShsOutDil",
    ];

    for (const key of possibleKeys) {
        const value = row[key];
        if (typeof value === "number" && value > 0) {
            return value;
        }
    }

    const rawJson = row.raw_json as Record<string, unknown> | undefined;
    if (rawJson) {
        for (const key of possibleKeys) {
            const value = rawJson[key];
            if (typeof value === "number" && value > 0) {
                return value;
            }
        }
    }

    return null;
}

function buildAnnualFreeCashFlowTotals(
    annualStatements: Array<{ statement_date: string; free_cash_flow: number | null }>
): AnnualFreeCashFlowTotal[] {
    return annualStatements
        .filter((item) => item.statement_date && item.free_cash_flow != null)
        .map((item) => ({
            year: new Date(item.statement_date).getUTCFullYear(),
            freeCashFlow: Number(item.free_cash_flow),
        }))
        .sort((a, b) => b.year - a.year);
}

function getCagrFromAnnualFreeCashFlowTotals(
    annualTotals: AnnualFreeCashFlowTotal[],
    years: number
): number | null {
    if (!annualTotals.length) return null;

    const end = annualTotals[0];
    const startYear = end.year - years;
    const start = annualTotals.find((item) => item.year === startYear);

    if (!start) {
        return null;
    }

    return calculateCagr(start.freeCashFlow, end.freeCashFlow, years);
}

export async function buildCashflowAnalytics(
    inputSymbol: string
): Promise<CashflowAnalytics> {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [
        recentQuarterlyCashFlows,
        annualCashFlows,
        quote,
        recentQuarterlyIncomeStatements,
    ] = await Promise.all([
        getRecentQuarterlyCashFlowStatementsBySymbol(symbol),
        getAnnualCashFlowStatementsBySymbol(symbol),
        getLatestQuoteBySymbolForCashflow(symbol),
        getRecentQuarterlyIncomeStatementsForShares(symbol),
    ]);

    const freeCashFlowTtm = sumLastNValues(
        recentQuarterlyCashFlows.map((item) => item.free_cash_flow),
        4
    );

    const sharesOutstandingCurrent =
        recentQuarterlyIncomeStatements.length > 0
            ? getSharesOutstandingFromIncomeRow(
                recentQuarterlyIncomeStatements[0] as Record<string, unknown>
            )
            : null;

    const freeCashFlowPerShareTtm =
        freeCashFlowTtm != null &&
            sharesOutstandingCurrent != null &&
            sharesOutstandingCurrent > 0
            ? freeCashFlowTtm / sharesOutstandingCurrent
            : null;

    const marketCap = quote?.raw_json && typeof quote.raw_json === "object"
        ? Number((quote.raw_json as Record<string, unknown>).marketCap ?? 0) || null
        : null;

    const freeCashFlowYield =
        freeCashFlowTtm != null && marketCap != null && marketCap > 0
            ? freeCashFlowTtm / marketCap
            : null;

    const annualFreeCashFlowTotals = buildAnnualFreeCashFlowTotals(
        annualCashFlows.map((item) => ({
            statement_date: item.statement_date,
            free_cash_flow: item.free_cash_flow,
        }))
    );

    const freeCashFlowCagr5Y = getCagrFromAnnualFreeCashFlowTotals(
        annualFreeCashFlowTotals,
        5
    );

    const freeCashFlowCagr10Y = getCagrFromAnnualFreeCashFlowTotals(
        annualFreeCashFlowTotals,
        10
    );

    return {
        symbol,
        freeCashFlowTtm,
        sharesOutstandingCurrent,
        freeCashFlowPerShareTtm,
        marketCap,
        freeCashFlowYield,
        freeCashFlowCagr5Y,
        freeCashFlowCagr10Y,
        annualFreeCashFlowTotals,
    };
}