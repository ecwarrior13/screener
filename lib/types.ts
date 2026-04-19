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
export type SavedCashFlowStatement = {
    id: number;
    symbol: string;
    statement_date: string;
    period: string | null;
    fiscal_year: string | null;
    operating_cash_flow: number | null;
    capital_expenditure: number | null;
    free_cash_flow: number | null;
    dividends_paid: number | null;
    net_income: number | null;
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
    cashFlowStatements: SavedCashFlowStatement[];
};

export type ScreenerHistoricalRow = {
    year: number;
    revenue: number | null;
    grossProfit: number | null;
    netIncome: number | null;
    eps: number | null;
    grossProfitRatio: number | null;
};

export type ScreenerCurrentMetrics = {
    revenue: number | null;
    grossProfit: number | null;
    netIncome: number | null;
    eps: number | null;
    fiveYearRevenueCagr: number | null;
    tenYearRevenueCagr: number | null;
    fiveYearNetIncomeCagr: number | null;
    tenYearNetIncomeCagr: number | null;
    lastYearGPR: number | null;
    fiveYearAvgGPR: number | null;
    tenYearAvgGPR: number | null;
};

export type ScreenerStockData = {
    ticker: string;
    companyName: string | null;
    currentMetrics: ScreenerCurrentMetrics;
    historicalData: ScreenerHistoricalRow[];
};

export type DividendHistoricalRow = {
    year: number;
    freeCashFlow: number | null;
    totalDividendsPaid: number | null;
    fcfPayoutRatio: number | null;
    adjustedDividend: number | null;
    payoutRatio: number | null;
};

export type DividendCurrentMetrics = {
    dividendYield: number | null;
    payoutRatio: number | null;
    latestDividend: number | null;
    latestDividendDate: string | null;
    annualDividend: number | null;
    fcfPayoutRatio: number | null;
    dividendCagr5: number | null;
    dividendCagr10: number | null;
    fcfCagr5: number | null;
    fcfCagr10: number | null;
};

export type DividendStockData = {
    ticker: string;
    companyName: string | null;
    stockPrice: number | null;
    currentMetrics: DividendCurrentMetrics;
    history: DividendHistoricalRow[];
};

