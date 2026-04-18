export type SavedQuote = {
    id: number;
    symbol: string;
    name: string | null;
    price: number | null;
    change: number | null;
    volume: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedProfile = {
    id: number;
    symbol: string;
    company_name: string | null;
    exchange: string | null;
    industry: string | null;
    sector: string | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedKeyMetrics = {
    id: number;
    symbol: string;
    market_cap: number | null;
    pe_ratio: number | null;
    pb_ratio: number | null;
    dividend_yield: number | null;
    current_ratio: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedDividend = {
    id: number;
    symbol: string;
    dividend_date: string;
    dividend: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};
export type SavedIncomeStatement = {
    id: number;
    symbol: string;
    statement_date: string;
    period: string | null;
    fiscal_year: string | null;
    revenue: number | null;
    net_income: number | null;
    gross_profit: number | null;
    operating_income: number | null;
    eps: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};
export type StockDetails = {
    symbol: string;
    quote: SavedQuote | null;
    profile: SavedProfile | null;
    keyMetrics: SavedKeyMetrics | null;
    dividends: SavedDividend[];
    incomeStatements: SavedIncomeStatement[];
};

