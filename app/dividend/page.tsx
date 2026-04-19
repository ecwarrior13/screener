"use client";

import { useState } from "react";
import Link from "next/link";
import { TickerSearch } from "@/components/screener/ticker-search";
import { DividendMetrics } from "@/components/dividend/dividend-metrics";
import { DividendHistory } from "@/components/dividend/dividend-history";
import type {
  DividendHistoricalRow,
  DividendStockData,
  SavedCashFlowStatement,
  SavedDividend,
  SavedIncomeStatement,
  StockDetails,
} from "@/lib/types";
import { ArrowLeft, Coins } from "lucide-react";

type StockDetailsApiResponse = StockDetails | { error: string };

function hasEnoughQuarterlyCashFlowData(details: StockDetails): boolean {
  return details.cashFlowStatements.filter(isQuarterlyCashFlowStatement).length >= 4;
}

function isAnnualStatement(
  statement: SavedIncomeStatement | SavedCashFlowStatement,
): boolean {
  return !statement.period || statement.period.toUpperCase() === "FY";
}

function isQuarterlyCashFlowStatement(
  statement: SavedCashFlowStatement,
): boolean {
  const period = statement.period?.toUpperCase();

  return period === "Q1" || period === "Q2" || period === "Q3" || period === "Q4";
}

function getStatementYear(
  statement: SavedIncomeStatement | SavedCashFlowStatement,
): number | null {
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

function getDividendYear(dividend: SavedDividend): number | null {
  const parsedYear = Number.parseInt(dividend.dividend_date.slice(0, 4), 10);

  return Number.isInteger(parsedYear) ? parsedYear : null;
}

function calculateRatioPercent(
  numerator: number | null,
  denominator: number | null,
): number | null {
  if (numerator === null || denominator === null || denominator <= 0) {
    return null;
  }

  return (numerator / denominator) * 100;
}

function calculateCagrPercent(
  endValue: number | null,
  startValue: number | null,
  yearSpan: number,
): number | null {
  if (
    endValue === null ||
    startValue === null ||
    endValue <= 0 ||
    startValue <= 0 ||
    yearSpan <= 0
  ) {
    return null;
  }

  return (Math.pow(endValue / startValue, 1 / yearSpan) - 1) * 100;
}

function buildAnnualDividendMap(dividends: SavedDividend[]): Map<number, number> {
  const annualDividends = new Map<number, number>();

  for (const dividend of dividends) {
    if (dividend.dividend === null) {
      continue;
    }

    const year = getDividendYear(dividend);

    if (year === null) {
      continue;
    }

    annualDividends.set(year, (annualDividends.get(year) ?? 0) + dividend.dividend);
  }

  return annualDividends;
}

function buildStatementMap<T extends SavedIncomeStatement | SavedCashFlowStatement>(
  statements: T[],
): Map<number, T> {
  const statementsByYear = new Map<number, T>();
  const sortedStatements = [...statements].sort((a, b) =>
    a.statement_date.localeCompare(b.statement_date),
  );

  for (const statement of sortedStatements) {
    if (!isAnnualStatement(statement)) {
      continue;
    }

    const year = getStatementYear(statement);

    if (year === null) {
      continue;
    }

    statementsByYear.set(year, statement);
  }

  return statementsByYear;
}

function buildDividendHistory(details: StockDetails): DividendHistoricalRow[] {
  const annualDividends = buildAnnualDividendMap(details.dividends);
  const incomeStatementsByYear = buildStatementMap(details.incomeStatements);
  const cashFlowStatementsByYear = buildStatementMap(details.cashFlowStatements);

  const years = new Set<number>([
    ...annualDividends.keys(),
    ...incomeStatementsByYear.keys(),
    ...cashFlowStatementsByYear.keys(),
  ]);

  return Array.from(years)
    .sort((a, b) => a - b)
    .map((year) => {
      const incomeStatement = incomeStatementsByYear.get(year);
      const cashFlowStatement = cashFlowStatementsByYear.get(year);
      const adjustedDividend = annualDividends.get(year) ?? null;
      const totalDividendsPaid =
        cashFlowStatement?.dividends_paid === null ||
        cashFlowStatement?.dividends_paid === undefined
          ? null
          : Math.abs(cashFlowStatement.dividends_paid);
      const freeCashFlow = cashFlowStatement?.free_cash_flow ?? null;

      return {
        year,
        freeCashFlow,
        totalDividendsPaid,
        fcfPayoutRatio: calculateRatioPercent(totalDividendsPaid, freeCashFlow),
        adjustedDividend,
        payoutRatio: calculateRatioPercent(
          adjustedDividend,
          incomeStatement?.eps ?? null,
        ),
      };
    })
    .filter((row) =>
      [
        row.freeCashFlow,
        row.totalDividendsPaid,
        row.fcfPayoutRatio,
        row.adjustedDividend,
        row.payoutRatio,
      ].some((value) => value !== null),
    );
}

function getLatestDividend(dividends: SavedDividend[]) {
  return [...dividends]
    .filter((dividend) => dividend.dividend !== null)
    .sort((a, b) => b.dividend_date.localeCompare(a.dividend_date))[0] ?? null;
}

function getTrailingAnnualDividend(dividends: SavedDividend[]): number | null {
  const latestDividend = getLatestDividend(dividends);

  if (!latestDividend) {
    return null;
  }

  const latestDividendDate = new Date(latestDividend.dividend_date);

  if (Number.isNaN(latestDividendDate.getTime())) {
    return null;
  }

  const windowStart = new Date(latestDividendDate);
  windowStart.setFullYear(windowStart.getFullYear() - 1);

  const trailingDividends = dividends
    .filter((dividend) => dividend.dividend !== null)
    .filter((dividend) => {
      const dividendDate = new Date(dividend.dividend_date);
      return dividendDate > windowStart && dividendDate <= latestDividendDate;
    })
    .reduce((sum, dividend) => sum + (dividend.dividend ?? 0), 0);

  return trailingDividends > 0 ? trailingDividends : null;
}

function getFcfPayoutRatioTtm(
  cashFlowStatements: SavedCashFlowStatement[],
): number | null {
  const latestQuarterlyStatements = [...cashFlowStatements]
    .filter(isQuarterlyCashFlowStatement)
    .sort((a, b) => b.statement_date.localeCompare(a.statement_date))
    .slice(0, 4);

  if (latestQuarterlyStatements.length < 4) {
    return null;
  }

  const fcfTtm = latestQuarterlyStatements.reduce((sum, statement) => {
    return sum + (statement.free_cash_flow ?? 0);
  }, 0);

  const hasMissingFcf = latestQuarterlyStatements.some(
    (statement) => statement.free_cash_flow === null,
  );
  const hasMissingDividendsPaid = latestQuarterlyStatements.some(
    (statement) => statement.dividends_paid === null,
  );

  if (hasMissingFcf || hasMissingDividendsPaid || fcfTtm <= 0) {
    return null;
  }

  const dividendsPaidTtm = latestQuarterlyStatements.reduce((sum, statement) => {
    return sum + Math.abs(statement.dividends_paid ?? 0);
  }, 0);

  return (dividendsPaidTtm / fcfTtm) * 100;
}

function getLatestNonNullMetric(
  history: DividendHistoricalRow[],
  key: "payoutRatio" | "fcfPayoutRatio" | "adjustedDividend" | "freeCashFlow",
) {
  return [...history].reverse().find((row) => row[key] !== null) ?? null;
}

function getPositiveComparableRows(
  history: DividendHistoricalRow[],
  key: "adjustedDividend" | "freeCashFlow",
) {
  return history.filter((row) => {
    const value = row[key];
    return value !== null && value > 0;
  });
}

function getRowByExactYear(
  rows: DividendHistoricalRow[],
  year: number,
) {
  return rows.find((row) => row.year === year) ?? null;
}

function getLatestCompletedHistoryRow(
  rows: DividendHistoricalRow[],
) {
  const currentYear = new Date().getFullYear();

  return [...rows].reverse().find((row) => row.year < currentYear) ?? null;
}

function formatDividendDate(date: string | null): string | null {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildDividendData(details: StockDetails): DividendStockData {
  const fullHistory = buildDividendHistory(details);
  const history = fullHistory.slice(-10);
  const latestDividend = getLatestDividend(details.dividends);
  const annualDividend = getTrailingAnnualDividend(details.dividends);
  const latestPayoutRatioRow = getLatestNonNullMetric(fullHistory, "payoutRatio");
  const fcfPayoutRatioTtm = getFcfPayoutRatioTtm(details.cashFlowStatements);
  const dividendHistoryRows = getPositiveComparableRows(
    fullHistory,
    "adjustedDividend",
  );
  const fcfHistoryRows = getPositiveComparableRows(fullHistory, "freeCashFlow");
  const latestDividendHistory =
    getLatestCompletedHistoryRow(dividendHistoryRows);
  const latestFcfHistory = getLatestCompletedHistoryRow(fcfHistoryRows);
  const fiveYearsDividendHistory =
    latestDividendHistory
      ? getRowByExactYear(dividendHistoryRows, latestDividendHistory.year - 5)
      : null;
  const tenYearsDividendHistory =
    latestDividendHistory
      ? getRowByExactYear(dividendHistoryRows, latestDividendHistory.year - 10)
      : null;
  const fiveYearsFcfHistory =
    latestFcfHistory
      ? getRowByExactYear(fcfHistoryRows, latestFcfHistory.year - 5)
      : null;
  const tenYearsFcfHistory =
    latestFcfHistory
      ? getRowByExactYear(fcfHistoryRows, latestFcfHistory.year - 10)
      : null;

  if (!latestDividend && fullHistory.length === 0) {
    throw new Error(`No saved dividend or cash flow history found for ${details.symbol}`);
  }

  return {
    ticker: details.symbol,
    companyName: details.profile?.company_name ?? details.quote?.name ?? null,
    stockPrice: details.quote?.price ?? null,
    currentMetrics: {
      dividendYield: calculateRatioPercent(
        annualDividend,
        details.quote?.price ?? null,
      ),
      payoutRatio: latestPayoutRatioRow?.payoutRatio ?? null,
      latestDividend: latestDividend?.dividend ?? null,
      latestDividendDate: formatDividendDate(latestDividend?.dividend_date ?? null),
      annualDividend,
      fcfPayoutRatio: fcfPayoutRatioTtm,
      dividendCagr5:
        latestDividendHistory && fiveYearsDividendHistory
          ? calculateCagrPercent(
              latestDividendHistory.adjustedDividend,
              fiveYearsDividendHistory.adjustedDividend,
              latestDividendHistory.year - fiveYearsDividendHistory.year,
            )
          : null,
      dividendCagr10:
        latestDividendHistory && tenYearsDividendHistory
          ? calculateCagrPercent(
              latestDividendHistory.adjustedDividend,
              tenYearsDividendHistory.adjustedDividend,
              latestDividendHistory.year - tenYearsDividendHistory.year,
            )
          : null,
      fcfCagr5:
        latestFcfHistory && fiveYearsFcfHistory
          ? calculateCagrPercent(
              latestFcfHistory.freeCashFlow,
              fiveYearsFcfHistory.freeCashFlow,
              latestFcfHistory.year - fiveYearsFcfHistory.year,
            )
          : null,
      fcfCagr10:
        latestFcfHistory && tenYearsFcfHistory
          ? calculateCagrPercent(
              latestFcfHistory.freeCashFlow,
              tenYearsFcfHistory.freeCashFlow,
              latestFcfHistory.year - tenYearsFcfHistory.year,
            )
          : null,
    },
    history,
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

async function syncStock(symbol: string): Promise<void> {
  const response = await fetch("/api/stock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symbol }),
  });

  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? `Failed syncing data for ${symbol}`);
  }
}

async function fetchDividendDetails(symbol: string): Promise<StockDetails> {
  const details = await fetchStockDetails(symbol);

  if (hasEnoughQuarterlyCashFlowData(details)) {
    return details;
  }

  await syncStock(symbol);

  return fetchStockDetails(symbol);
}

export default function DividendPage() {
  const [data, setData] = useState<DividendStockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (ticker: string) => {
    const cleanTicker = ticker.trim().toUpperCase();

    if (!cleanTicker) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setData(null);

    try {
      const details = await fetchDividendDetails(cleanTicker);
      setData(buildDividendData(details));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load dividend data.";
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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/cash-flow"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cash Flow Analysis
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Dividend Breakdown
              </h1>
              <p className="text-muted-foreground">
                Dividend metrics, payout ratios, and growth analysis
              </p>
            </div>
          </div>
        </header>

        {/* Ticker Search */}
        <section className="mb-8">
          <TickerSearch onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {errorMessage && !isLoading && (
          <div className="mb-8 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Stock Header */}
            <div className="flex items-baseline gap-4">
              <h2 className="text-3xl font-bold text-foreground">
                {data.companyName ?? data.ticker}
              </h2>
              <span className="text-2xl text-muted-foreground">
                {data.stockPrice === null ? "N/A" : `$${data.stockPrice.toFixed(2)}`}
              </span>
            </div>

            {/* Dividend Metrics */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Current Dividend Metrics
              </h3>
              <DividendMetrics data={data} />
            </section>

            {/* 10-Year History Table */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                10-Year Dividend &amp; Cash Flow History
              </h3>
              <DividendHistory history={data.history} />
            </section>
          </div>
        )}

        {!data && !isLoading && !errorMessage && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Enter a stock ticker above to view dividend breakdown and payout
              analysis
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
