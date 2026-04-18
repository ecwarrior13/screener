import { supabaseAdmin } from "@/lib/supabase-server";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = {
    [key: string]: JsonValue | undefined;
};

type FmpQuote = JsonObject & {
    name?: string | null;
    price?: number | null;
    change?: number | null;
    volume?: number | null;
};

type FmpProfile = JsonObject & {
    companyName?: string | null;
    exchangeShortName?: string | null;
    exchange?: string | null;
    industry?: string | null;
    sector?: string | null;
};

type FmpKeyMetrics = JsonObject & {
    marketCap?: number | null;
    peRatio?: number | null;
    pe?: number | null;
    pbRatio?: number | null;
    priceToBookRatio?: number | null;
    dividendYield?: number | null;
    currentRatio?: number | null;
};

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
