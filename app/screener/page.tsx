"use client";

import { useState } from "react";
import { TickerSearch } from "@/components/screener/ticker-search";
import { MetricsGrid } from "@/components/screener/metrics-grid";
import { HistoricalTable } from "@/components/screener/historical-table";
import type {
  SavedIncomeStatement,
  ScreenerHistoricalRow,
  ScreenerStockData,
  StockDetails,
} from "@/lib/types";
import { TrendingUp } from "lucide-react";

type StockDetailsApiResponse = StockDetails | { error: string };

function isAnnualIncomeStatement(statement: SavedIncomeStatement): boolean {
  return !statement.period || statement.period.toUpperCase() === "FY";
}

function getStatementYear(statement: SavedIncomeStatement): number | null {
  const fiscalYear = statement.fiscal_year?.trim();

  if (fiscalYear) {
    const parsedFiscalYear = Number.parseInt(fiscalYear, 10);

    if (Number.isInteger(parsedFiscalYear)) {
      return parsedFiscalYear;
    }
  }

  const parsedDateYear = Number.parseInt(statement.statement_date.slice(0, 4), 10);

  return Number.isInteger(parsedDateYear) ? parsedDateYear : null;
}

function calculateGrossProfitRatio(
  grossProfit: number | null,
  revenue: number | null,
): number | null {
  if (grossProfit === null || revenue === null || revenue === 0) {
    return null;
  }

  return grossProfit / revenue;
}

function average(values: Array<number | null>): number | null {
  const definedValues = values.filter((value): value is number => value !== null);

  if (definedValues.length === 0) {
    return null;
  }

  return definedValues.reduce((sum, value) => sum + value, 0) / definedValues.length;
}

function calculateCagr(
  endValue: number | null,
  startValue: number | null,
  yearSpan: number,
): number | null {
  if (
    endValue === null ||
    startValue === null ||
    startValue <= 0 ||
    endValue <= 0 ||
    yearSpan <= 0
  ) {
    return null;
  }

  return Math.pow(endValue / startValue, 1 / yearSpan) - 1;
}

function buildHistoricalData(
  statements: SavedIncomeStatement[],
): ScreenerHistoricalRow[] {
  const rowsByYear = new Map<number, ScreenerHistoricalRow>();

  const sortedStatements = [...statements].sort((a, b) =>
    a.statement_date.localeCompare(b.statement_date),
  );

  for (const statement of sortedStatements) {
    if (!isAnnualIncomeStatement(statement)) {
      continue;
    }

    const year = getStatementYear(statement);

    if (year === null) {
      continue;
    }

    rowsByYear.set(year, {
      year,
      revenue: statement.revenue,
      grossProfit: statement.gross_profit,
      netIncome: statement.net_income,
      eps: statement.eps,
      grossProfitRatio: calculateGrossProfitRatio(
        statement.gross_profit,
        statement.revenue,
      ),
    });
  }

  return Array.from(rowsByYear.values())
    .sort((a, b) => a.year - b.year)
    .slice(-10);
}

function buildScreenerData(details: StockDetails): ScreenerStockData {
  const historicalData = buildHistoricalData(details.incomeStatements);

  if (historicalData.length === 0) {
    throw new Error(`No saved income statement history found for ${details.symbol}`);
  }

  const latestData = historicalData[historicalData.length - 1];
  const fiveYearsAgo =
    historicalData.length >= 6 ? historicalData[historicalData.length - 6] : null;
  const tenYearsAgo =
    historicalData.length >= 10
      ? historicalData[historicalData.length - 10]
      : null;

  return {
    ticker: details.symbol,
    companyName: details.profile?.company_name ?? details.quote?.name ?? null,
    currentMetrics: {
      revenue: latestData.revenue,
      grossProfit: latestData.grossProfit,
      netIncome: latestData.netIncome,
      eps: latestData.eps,
      fiveYearRevenueCagr:
        latestData && fiveYearsAgo
          ? calculateCagr(
              latestData.revenue,
              fiveYearsAgo.revenue,
              latestData.year - fiveYearsAgo.year,
            )
          : null,
      tenYearRevenueCagr:
        latestData && tenYearsAgo
          ? calculateCagr(
              latestData.revenue,
              tenYearsAgo.revenue,
              latestData.year - tenYearsAgo.year,
            )
          : null,
      fiveYearNetIncomeCagr:
        latestData && fiveYearsAgo
          ? calculateCagr(
              latestData.netIncome,
              fiveYearsAgo.netIncome,
              latestData.year - fiveYearsAgo.year,
            )
          : null,
      tenYearNetIncomeCagr:
        latestData && tenYearsAgo
          ? calculateCagr(
              latestData.netIncome,
              tenYearsAgo.netIncome,
              latestData.year - tenYearsAgo.year,
            )
          : null,
      lastYearGPR: latestData.grossProfitRatio,
      fiveYearAvgGPR: average(
        historicalData.slice(-5).map((row) => row.grossProfitRatio),
      ),
      tenYearAvgGPR: average(
        historicalData.slice(-10).map((row) => row.grossProfitRatio),
      ),
    },
    historicalData,
  };
}

async function fetchStockDetails(symbol: string): Promise<StockDetails> {
  const response = await fetch(`/api/stock/${encodeURIComponent(symbol)}/details`);
  const payload = (await response.json()) as StockDetailsApiResponse;

  if (!response.ok) {
    if ("error" in payload) {
      throw new Error(payload.error);
    }

    throw new Error(`Failed loading saved data for ${symbol}`);
  }

  if ("error" in payload) {
    throw new Error(payload.error);
  }

  return payload;
}

export default function StockScreenerPage() {
  const [stockData, setStockData] = useState<ScreenerStockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (ticker: string) => {
    const cleanTicker = ticker.trim().toUpperCase();

    if (!cleanTicker) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStockData(null);

    try {
      const details = await fetchStockDetails(cleanTicker);
      const data = buildScreenerData(details);
      setStockData(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load stock data.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Stock Screener
            </h1>
          </div>
          <p className="text-muted-foreground">
            Analyze key financial metrics and historical performance
          </p>
        </header>

        {/* Ticker Search */}
        <TickerSearch onSearch={handleSearch} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="mt-8 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Results */}
        {stockData && !isLoading && (
          <div className="mt-8 space-y-8">
            {/* Company Header */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl">
                {stockData.ticker.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {stockData.companyName ?? stockData.ticker}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {stockData.companyName
                    ? `${stockData.ticker} - Financial Overview`
                    : "Financial Overview"}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <MetricsGrid metrics={stockData.currentMetrics} />

            {/* Historical Table */}
            <HistoricalTable data={stockData.historicalData} />
          </div>
        )}

        {/* Empty State */}
        {!stockData && !isLoading && !errorMessage && (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Enter a Stock Ticker
            </h3>
            <p className="text-muted-foreground max-w-md">
              Search for any stock symbol to view detailed financial metrics and
              historical performance data.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
