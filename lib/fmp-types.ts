export type FmpQuote = {
    symbol?: string;
    name?: string;
    price?: number;
    change?: number;
    volume?: number;
};

export type FmpProfile = {
    symbol?: string;
    companyName?: string;
    exchange?: string;
    exchangeShortName?: string;
    industry?: string;
    sector?: string;
};

export type FmpKeyMetrics = {
    symbol?: string;
    marketCap?: number;
    peRatio?: number;
    pe?: number;
    pbRatio?: number;
    priceToBookRatio?: number;
    dividendYield?: number;
    currentRatio?: number;
};

export type FmpDividend = {
    symbol?: string;
    date?: string;
    dividend?: number;
};

export type FmpIncomeStatement = {
    symbol?: string;
    date?: string;
    period?: string;
    calendarYear?: string;
    fiscalYear?: string;
    revenue?: number;
    netIncome?: number;
    grossProfit?: number;
    operatingIncome?: number;
    eps?: number;
};

export type FmpBalanceSheet = {
    symbol?: string;
    date?: string;
    period?: string;
    calendarYear?: string;
    fiscalYear?: string;
    totalAssets?: number;
    totalLiabilities?: number;
    totalStockholdersEquity?: number;
    cashAndCashEquivalents?: number;
    totalDebt?: number;
};
export type FmpCashFlowStatement = {
    symbol?: string;
    date?: string;
    period?: string;
    calendarYear?: string;
    fiscalYear?: string;
    operatingCashFlow?: number;
    capitalExpenditure?: number;
    freeCashFlow?: number;
    dividendsPaid?: number;
    netIncome?: number;
};