import { supabaseAdmin } from "@/lib/supabase-server";
import type {
    FmpBalanceSheet,
    FmpCashFlowStatement,
    FmpDividend,
    FmpEarnings,
    FmpFinancialGrowth,
    FmpFinancialScores,
    FmpRatio,
    FmpRatioTtm,
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
            dividends_paid: item.commonDividendsPaid ?? null,
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
export async function saveFinancialScores(
    symbol: string,
    scores: FmpFinancialScores
) {
    const { error } = await supabaseAdmin
        .from("fmprep_financial_scores")
        .upsert(
            {
                symbol,
                score_date: scores.date ?? null,
                altman_z_score: scores.altmanZScore ?? null,
                piotroski_score: scores.piotroskiScore ?? null,
                working_capital: scores.workingCapital ?? null,
                total_assets: scores.totalAssets ?? null,
                retained_earnings: scores.retainedEarnings ?? null,
                ebit: scores.ebit ?? null,
                market_cap: scores.marketCap ?? null,
                liabilities: scores.liabilities ?? null,
                revenue: scores.revenue ?? null,
                raw_json: scores,
                fetched_at: new Date().toISOString(),
            },
            { onConflict: "symbol" }
        );

    if (error) {
        throw new Error(`Failed saving financial scores: ${error.message}`);
    }
}
export async function saveFinancialGrowth(
    symbol: string,
    growthRows: FmpFinancialGrowth[]
) {
    if (!growthRows.length) {
        return;
    }

    const rows = growthRows
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            growth_date: item.date!,
            period: item.period ?? null,
            fiscal_year: item.fiscalYear ?? null,
            growth_revenue: item.growthRevenue ?? null,
            growth_net_income: item.growthNetIncome ?? null,
            growth_eps: item.growthEPS ?? null,
            growth_operating_cash_flow: item.growthOperatingCashFlow ?? null,
            growth_free_cash_flow: item.growthFreeCashFlow ?? null,
            growth_total_assets: item.growthTotalAssets ?? null,
            growth_total_liabilities: item.growthTotalLiabilities ?? null,
            growth_total_equity: item.growthTotalEquity ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_financial_growth")
        .upsert(rows, {
            onConflict: "symbol,growth_date,period",
        });

    if (error) {
        throw new Error(`Failed saving financial growth: ${error.message}`);
    }
}
export async function saveEarnings(
    symbol: string,
    earningsRows: FmpEarnings[]
) {
    if (!earningsRows.length) {
        return;
    }

    const rows = earningsRows
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            earnings_date: item.date!,
            period: item.period ?? null,
            eps: item.eps ?? null,
            eps_estimated: item.estimatedEps ?? null,
            revenue: item.revenue ?? null,
            revenue_estimated: item.estimatedRevenue ?? null,
            fiscal_date_ending: item.fiscalDateEnding ?? null,
            updated_from_date: item.updatedFromDate ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_earnings")
        .upsert(rows, {
            onConflict: "symbol,earnings_date,period",
        });

    if (error) {
        throw new Error(`Failed saving earnings: ${error.message}`);
    }
}
export async function saveRatios(
    symbol: string,
    ratioRows: FmpRatio[]
) {
    if (!ratioRows.length) {
        return;
    }

    const rows = ratioRows
        .filter((item) => item?.date)
        .map((item) => ({
            symbol,
            ratio_date: item.date!,
            period: item.period ?? null,
            fiscal_year: item.fiscalYear ?? null,
            gross_profit_margin: item.grossProfitMargin ?? null,
            operating_profit_margin: item.operatingProfitMargin ?? null,
            net_profit_margin: item.netProfitMargin ?? null,
            current_ratio: item.currentRatio ?? null,
            quick_ratio: item.quickRatio ?? null,
            debt_to_equity: item.debtEquityRatio ?? null,
            return_on_equity: item.returnOnEquity ?? null,
            return_on_assets: item.returnOnAssets ?? null,
            price_to_earnings_ratio: item.priceEarningsRatio ?? null,
            price_to_book_ratio: item.priceToBookRatio ?? null,
            raw_json: item,
            fetched_at: new Date().toISOString(),
        }));

    if (!rows.length) {
        return;
    }

    const { error } = await supabaseAdmin
        .from("fmprep_ratios")
        .upsert(rows, {
            onConflict: "symbol,ratio_date,period",
        });

    if (error) {
        throw new Error(`Failed saving ratios: ${error.message}`);
    }
}

export async function saveRatiosTtm(
    symbol: string,
    ratioTtm: FmpRatioTtm
) {
    const { error } = await supabaseAdmin
        .from("fmprep_ratios_ttm")
        .upsert(
            {
                symbol,
                ratio_date: ratioTtm.date ?? null,
                gross_profit_margin: ratioTtm.grossProfitMarginTTM ?? null,
                operating_profit_margin: ratioTtm.operatingProfitMarginTTM ?? null,
                net_profit_margin: ratioTtm.netProfitMarginTTM ?? null,
                current_ratio: ratioTtm.currentRatioTTM ?? null,
                quick_ratio: ratioTtm.quickRatioTTM ?? null,
                debt_to_equity: ratioTtm.debtToEquityRatioTTM ?? null,
                return_on_equity: ratioTtm.returnOnEquityTTM ?? null,
                return_on_assets: ratioTtm.returnOnAssetsTTM ?? null,
                price_to_earnings_ratio: ratioTtm.priceToEarningsRatioTTM ?? null,
                price_to_book_ratio: ratioTtm.priceToBookRatioTTM ?? null,
                raw_json: ratioTtm,
                fetched_at: new Date().toISOString(),
            },
            { onConflict: "symbol" }
        );

    if (error) {
        throw new Error(`Failed saving ratios ttm: ${error.message}`);
    }
}