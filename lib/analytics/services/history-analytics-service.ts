import { safeDivide } from "@/lib/analytics/calculations/per-share";
import {
    getAnnualCashFlowStatementsBySymbolForHistory,
    getAnnualIncomeStatementsBySymbol,
} from "@/lib/analytics/queries/history-queries";
import { calculateRoic } from "@/lib/analytics/calculations/roic";
import { getAnnualBalanceSheetsBySymbol } from "@/lib/analytics/queries/history-queries";

type YearValue = {
    year: number;
    value: number | null;
};

type HistoryAnalytics = {
    symbol: string;
    eps10YHistory: YearValue[];
    sharesOutstanding10YHistory: YearValue[];
    revenuePerShare10YHistory: YearValue[];
    freeCashFlowPerShare10YHistory: YearValue[];
    debtToAssets10YHistory: YearValue[];
    roic10YHistory: YearValue[];
};

function extractYear(dateString: string | null | undefined): number | null {
    if (!dateString) return null;

    const year = new Date(dateString).getUTCFullYear();
    return Number.isFinite(year) ? year : null;
}

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

export async function buildHistoryAnalytics(
    inputSymbol: string
): Promise<HistoryAnalytics> {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [annualIncomeStatements, annualCashFlowStatements, annualBalanceSheets] =
        await Promise.all([
            getAnnualIncomeStatementsBySymbol(symbol),
            getAnnualCashFlowStatementsBySymbolForHistory(symbol),
            getAnnualBalanceSheetsBySymbol(symbol),
        ]);

    const cashFlowByYear = new Map<number, number | null>();

    const balanceSheetByYear = new Map<
        number,
        {
            totalDebt: number | null;
            totalAssets: number | null;
            totalEquity: number | null;
        }
    >();

    for (const row of annualBalanceSheets) {
        const year = extractYear(row.statement_date);
        if (!year) continue;

        balanceSheetByYear.set(year, {
            totalDebt: row.total_debt != null ? Number(row.total_debt) : null,
            totalAssets: row.total_assets != null ? Number(row.total_assets) : null,
            totalEquity:
                row.total_stockholders_equity != null
                    ? Number(row.total_stockholders_equity)
                    : null,
        });
    }

    for (const row of annualCashFlowStatements) {
        const year = extractYear(row.statement_date);
        if (!year) continue;

        cashFlowByYear.set(year, row.free_cash_flow != null ? Number(row.free_cash_flow) : null);
    }

    const eps10YHistory: YearValue[] = [];
    const sharesOutstanding10YHistory: YearValue[] = [];
    const revenuePerShare10YHistory: YearValue[] = [];
    const freeCashFlowPerShare10YHistory: YearValue[] = [];
    const debtToAssets10YHistory: YearValue[] = [];
    const roic10YHistory: YearValue[] = [];

    for (const row of annualIncomeStatements) {
        const year = extractYear(row.statement_date);
        if (!year) continue;

        const eps = row.eps != null ? Number(row.eps) : null;
        const revenue = row.revenue != null ? Number(row.revenue) : null;
        const sharesOutstanding = getSharesOutstandingFromIncomeRow(
            row as Record<string, unknown>
        );
        const freeCashFlow = cashFlowByYear.get(year) ?? null;

        eps10YHistory.push({
            year,
            value: eps,
        });

        sharesOutstanding10YHistory.push({
            year,
            value: sharesOutstanding,
        });

        revenuePerShare10YHistory.push({
            year,
            value: safeDivide(revenue, sharesOutstanding),
        });

        freeCashFlowPerShare10YHistory.push({
            year,
            value: safeDivide(freeCashFlow, sharesOutstanding),
        });
        const operatingIncome =
            row.operating_income != null ? Number(row.operating_income) : null;

        const balanceSheet = balanceSheetByYear.get(year);

        const totalDebt = balanceSheet?.totalDebt ?? null;
        const totalAssets = balanceSheet?.totalAssets ?? null;
        const totalEquity = balanceSheet?.totalEquity ?? null;

        debtToAssets10YHistory.push({
            year,
            value: safeDivide(totalDebt, totalAssets),
        });

        roic10YHistory.push({
            year,
            value: calculateRoic(operatingIncome, totalDebt, totalEquity),
        });
    }

    return {
        symbol,
        eps10YHistory,
        sharesOutstanding10YHistory,
        revenuePerShare10YHistory,
        freeCashFlowPerShare10YHistory,
        debtToAssets10YHistory,
        roic10YHistory,
    };
}