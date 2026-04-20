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
export type SavedFinancialScores = {
    id: number;
    symbol: string;
    score_date: string | null;
    altman_z_score: number | null;
    piotroski_score: number | null;
    working_capital: number | null;
    total_assets: number | null;
    retained_earnings: number | null;
    ebit: number | null;
    market_cap: number | null;
    liabilities: number | null;
    revenue: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedRatioTtm = {
    id: number;
    symbol: string;
    ratio_date: string | null;
    gross_profit_margin: number | null;
    operating_profit_margin: number | null;
    net_profit_margin: number | null;
    current_ratio: number | null;
    quick_ratio: number | null;
    debt_to_equity: number | null;
    return_on_equity: number | null;
    return_on_assets: number | null;
    price_to_earnings_ratio: number | null;
    price_to_book_ratio: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};
export type SavedFinancialGrowth = {
    id: number;
    symbol: string;
    growth_date: string;
    period: string | null;
    fiscal_year: string | null;
    growth_revenue: number | null;
    growth_net_income: number | null;
    growth_eps: number | null;
    growth_operating_cash_flow: number | null;
    growth_free_cash_flow: number | null;
    growth_total_assets: number | null;
    growth_total_liabilities: number | null;
    growth_total_equity: number | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedEarnings = {
    id: number;
    symbol: string;
    earnings_date: string;
    period: string | null;
    eps: number | null;
    eps_estimated: number | null;
    revenue: number | null;
    revenue_estimated: number | null;
    fiscal_date_ending: string | null;
    updated_from_date: string | null;
    raw_json: unknown;
    fetched_at: string;
    created_at: string;
    updated_at: string;
};

export type SavedRatio = {
    id: number;
    symbol: string;
    ratio_date: string;
    period: string | null;
    fiscal_year: string | null;
    gross_profit_margin: number | null;
    operating_profit_margin: number | null;
    net_profit_margin: number | null;
    current_ratio: number | null;
    quick_ratio: number | null;
    debt_to_equity: number | null;
    return_on_equity: number | null;
    return_on_assets: number | null;
    price_to_earnings_ratio: number | null;
    price_to_book_ratio: number | null;
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
    financialScores: SavedFinancialScores | null;
    ratiosTtm: SavedRatioTtm | null;
    financialGrowth: SavedFinancialGrowth[];
    earnings: SavedEarnings[];
    ratios: SavedRatio[];
};