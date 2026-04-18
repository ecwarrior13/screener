import { supabaseAdmin } from "@/lib/supabase-server";
import type {
    FmpBalanceSheet,
    FmpCashFlowStatement,
    FmpDividend,
    FmpIncomeStatement,
    FmpKeyMetrics,
    FmpProfile,
    FmpQuote,
} from "@/lib/fmp-types";

export async function saveQuote(symbol: string, quote: FmpQuote) {
    const { error } = await supabaseAdmin
        .from("fmprep_quotes")
        .upsert(
            {
                symbol,
                name: quote.name ?? null,
                price: quote.price ?? null,
                change: quote.change ?? null,
                volume: quote.volume ?? null,
                raw_json: quote,
                fetched_at: new Date().toISOString(),
            },
            { onConflict: "symbol" }
        );

    if (error) {
        throw new Error(`Failed saving quote: ${error.message}`);
    }
}

export async function saveProfile(symbol: string, profile: FmpProfile) {
    const { error } = await supabaseAdmin
        .from("fmprep_profiles")
        .upsert(
            {
                symbol,
                company_name: profile.companyName ?? null,
                exchange: profile.exchangeShortName ?? profile.exchange ?? null,
                industry: profile.industry ?? null,
                sector: profile.sector ?? null,
                raw_json: profile,
                fetched_at: new Date().toISOString(),
            },
            { onConflict: "symbol" }
        );

    if (error) {
        throw new Error(`Failed saving profile: ${error.message}`);
    }
}

export async function saveKeyMetrics(symbol: string, metrics: FmpKeyMetrics) {
    const { error } = await supabaseAdmin
        .from("fmprep_key_metrics")
        .upsert(
            {
                symbol,
                market_cap: metrics.marketCap ?? null,
                pe_ratio: metrics.peRatio ?? metrics.pe ?? null,
                pb_ratio: metrics.pbRatio ?? metrics.priceToBookRatio ?? null,
                dividend_yield: metrics.dividendYield ?? null,
                current_ratio: metrics.currentRatio ?? null,
                raw_json: metrics,
                fetched_at: new Date().toISOString(),
            },
            { onConflict: "symbol" }
        );

    if (error) {
        throw new Error(`Failed saving key metrics: ${error.message}`);
    }
}

export async function saveDividends(symbol: string, dividends: FmpDividend[]) {
    if (!dividends.length) {
        return;
    }

    const rows = dividends
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            dividend_date: item.date,
            dividend: item.dividend ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_dividends")
        .upsert(rows, {
            onConflict: "symbol,dividend_date",
        });

    if (error) {
        throw new Error(`Failed saving dividends: ${error.message}`);
    }
}
export async function saveIncomeStatements(symbol: string, statements: FmpIncomeStatement[]) {
    if (!statements.length) {
        return;
    }

    const rows = statements
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            statement_date: item.date,
            period: item.period ?? null,
            fiscal_year: item.calendarYear ?? item.fiscalYear ?? null,
            revenue: item.revenue ?? null,
            net_income: item.netIncome ?? null,
            gross_profit: item.grossProfit ?? null,
            operating_income: item.operatingIncome ?? null,
            eps: item.eps ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_income_statements")
        .upsert(rows, {
            onConflict: "symbol,statement_date,period",
        });

    if (error) {
        throw new Error(`Failed saving income statements: ${error.message}`);
    }
}
export async function saveBalanceSheets(symbol: string, statements: FmpBalanceSheet[]) {
    if (!statements.length) {
        return;
    }

    const rows = statements
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            statement_date: item.date,
            period: item.period ?? null,
            fiscal_year: item.calendarYear ?? item.fiscalYear ?? null,
            total_assets: item.totalAssets ?? null,
            total_liabilities: item.totalLiabilities ?? null,
            total_stockholders_equity: item.totalStockholdersEquity ?? null,
            cash_and_cash_equivalents: item.cashAndCashEquivalents ?? null,
            total_debt: item.totalDebt ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_balance_sheets")
        .upsert(rows, {
            onConflict: "symbol,statement_date,period",
        });

    if (error) {
        throw new Error(`Failed saving balance sheets: ${error.message}`);
    }
}
export async function saveCashFlowStatements(
    symbol: string,
    statements: FmpCashFlowStatement[]
) {
    if (!statements.length) {
        return;
    }

    const rows = statements
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            statement_date: item.date!,
            period: item.period ?? null,
            fiscal_year: item.calendarYear ?? item.fiscalYear ?? null,
            operating_cash_flow: item.operatingCashFlow ?? null,
            capital_expenditure: item.capitalExpenditure ?? null,
            free_cash_flow: item.freeCashFlow ?? null,
            dividends_paid: item.dividendsPaid ?? null,
            net_income: item.netIncome ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_cash_flow_statements")
        .upsert(rows, {
            onConflict: "symbol,statement_date,period",
        });

    if (error) {
        throw new Error(`Failed saving cash flow statements: ${error.message}`);
    }
}