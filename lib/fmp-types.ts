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
    commonDividendsPaid?: number;
    netIncome?: number;
};
export type FmpFinancialScores = {
    symbol?: string;
    date?: string;
    altmanZScore?: number;
    piotroskiScore?: number;
    workingCapital?: number;
    totalAssets?: number;
    retainedEarnings?: number;
    ebit?: number;
    marketCap?: number;
    liabilities?: number;
    revenue?: number;
};
export type FmpFinancialGrowth = {
    symbol?: string;
    date?: string;
    fiscalYear?: string;
    period?: string;
    growthRevenue?: number;
    growthNetIncome?: number;
    growthEPS?: number;
    growthOperatingCashFlow?: number;
    growthFreeCashFlow?: number;
    growthTotalAssets?: number;
    growthTotalLiabilities?: number;
    growthTotalEquity?: number;
};
export type FmpEarnings = {
    symbol?: string;
    date?: string;
    period?: string;
    eps?: number;
    estimatedEps?: number;
    revenue?: number;
    estimatedRevenue?: number;
    fiscalDateEnding?: string;
    updatedFromDate?: string;
};
export type FmpRatio = {
    symbol?: string;
    date?: string;
    fiscalYear?: string;
    period?: string;
    grossProfitMargin?: number;
    operatingProfitMargin?: number;
    netProfitMargin?: number;
    currentRatio?: number;
    quickRatio?: number;
    debtEquityRatio?: number;
    returnOnEquity?: number;
    returnOnAssets?: number;
    priceEarningsRatio?: number;
    priceToBookRatio?: number;
};

export type FmpRatioTtm = {
    symbol?: string;
    date?: string;
    grossProfitMarginTTM?: number;
    operatingProfitMarginTTM?: number;
    netProfitMarginTTM?: number;
    currentRatioTTM?: number;
    quickRatioTTM?: number;
    debtToEquityRatioTTM?: number;
    returnOnEquityTTM?: number;
    returnOnAssetsTTM?: number;
    priceToEarningsRatioTTM?: number;
    priceToBookRatioTTM?: number;
};