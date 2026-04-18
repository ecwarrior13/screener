import type {
    FmpBalanceSheet,
    FmpCashFlowStatement,
    FmpDividend,
    FmpIncomeStatement,
    FmpKeyMetrics,
    FmpProfile,
    FmpQuote,
} from "@/lib/fmp-types";

async function fmpRequest<T>(
    endpoint: string,
    symbol: string,
    options?: {
        returnArray?: boolean;
        query?: Record<string, string | number | boolean | undefined>;
    }
): Promise<T | T[] | null> {
    const apiKey = process.env.FMP_API_KEY;

    if (!apiKey) {
        throw new Error("Missing FMP_API_KEY in .env.local");
    }

    const url = new URL(`https://financialmodelingprep.com/stable/${endpoint}`);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("apikey", apiKey);

    if (options?.query) {
        for (const [key, value] of Object.entries(options.query)) {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Failed FMP request for ${endpoint}`);
    }

    const data: unknown = await response.json();

    if (options?.returnArray) {
        return Array.isArray(data) ? (data as T[]) : [];
    }

    return Array.isArray(data) ? ((data[0] ?? null) as T | null) : (data as T);
}
export function fetchFmpQuote(symbol: string): Promise<FmpQuote | null> {
    return fmpRequest<FmpQuote>("quote", symbol) as Promise<FmpQuote | null>;
}

export function fetchFmpProfile(symbol: string): Promise<FmpProfile | null> {
    return fmpRequest<FmpProfile>("profile", symbol) as Promise<FmpProfile | null>;
}

export function fetchFmpKeyMetrics(
    symbol: string
): Promise<FmpKeyMetrics | null> {
    return fmpRequest<FmpKeyMetrics>("key-metrics", symbol) as Promise<
        FmpKeyMetrics | null
    >;
}

export function fetchFmpDividends(symbol: string): Promise<FmpDividend[]> {
    return fmpRequest<FmpDividend>("dividends", symbol, {
        returnArray: true,
    }) as Promise<FmpDividend[]>;
}

export function fetchFmpIncomeStatement(
    symbol: string,
    limit = 10
): Promise<FmpIncomeStatement[]> {
    return fmpRequest<FmpIncomeStatement>("income-statement", symbol, {
        returnArray: true,
        query: { limit },
    }) as Promise<FmpIncomeStatement[]>;
}

export function fetchFmpBalanceSheet(
    symbol: string
): Promise<FmpBalanceSheet[]> {
    return fmpRequest<FmpBalanceSheet>("balance-sheet-statement", symbol, {
        returnArray: true,
    }) as Promise<FmpBalanceSheet[]>;
}
export function fetchFmpCashFlowStatement(
    symbol: string
): Promise<FmpCashFlowStatement[]> {
    return fmpRequest<FmpCashFlowStatement>("cash-flow-statement", symbol, {
        returnArray: true,
    }) as Promise<FmpCashFlowStatement[]>;
}