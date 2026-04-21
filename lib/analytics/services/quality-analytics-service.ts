import { averageScores, clampScore } from "@/lib/analytics/calculations/scoring";
import { buildUnifiedAnalytics } from "@/lib/analytics/services/unified-analytics-service";

type ScoreDetail = {
    score: number | null;
    notes: string[];
};

type QualityAnalytics = {
    symbol: string;
    dividendSafety: ScoreDetail;
    cashFlowStrength: ScoreDetail;
    balanceSheetHealth: ScoreDetail;
    profitabilityEfficiency: ScoreDetail;
    growthQuality: ScoreDetail;
    overallQualityScore: number | null;
};

function scoreDividendSafety(input: {
    payoutRatioTtm: number | null;
}): ScoreDetail {
    const notes: string[] = [];
    let score = 5;

    if (input.payoutRatioTtm == null) {
        notes.push("TTM payout ratio unavailable.");
        return { score: null, notes };
    }

    const payoutRatio = input.payoutRatioTtm;

    if (payoutRatio < 0.4) {
        score = 9;
        notes.push("Low payout ratio suggests strong dividend coverage.");
    } else if (payoutRatio < 0.6) {
        score = 7.5;
        notes.push("Payout ratio appears reasonable.");
    } else if (payoutRatio < 0.8) {
        score = 5.5;
        notes.push("Payout ratio is elevated.");
    } else if (payoutRatio <= 1) {
        score = 3.5;
        notes.push("Payout ratio is high and leaves less margin for safety.");
    } else {
        score = 1.5;
        notes.push("Dividend appears under pressure based on payout ratio.");
    }

    return { score: clampScore(score), notes };
}

function scoreCashFlowStrength(input: {
    freeCashFlowYield: number | null;
    freeCashFlowCagr5Y: number | null;
}): ScoreDetail {
    const notes: string[] = [];
    let score = 5;

    if (input.freeCashFlowYield == null && input.freeCashFlowCagr5Y == null) {
        notes.push("Free cash flow metrics unavailable.");
        return { score: null, notes };
    }

    if (input.freeCashFlowYield != null) {
        if (input.freeCashFlowYield > 0.06) {
            score += 2;
            notes.push("Free cash flow yield is strong.");
        } else if (input.freeCashFlowYield > 0.03) {
            score += 1;
            notes.push("Free cash flow yield is decent.");
        } else {
            score -= 1;
            notes.push("Free cash flow yield is modest.");
        }
    }

    if (input.freeCashFlowCagr5Y != null) {
        if (input.freeCashFlowCagr5Y > 0.12) {
            score += 2;
            notes.push("5Y free cash flow growth is strong.");
        } else if (input.freeCashFlowCagr5Y > 0.05) {
            score += 1;
            notes.push("5Y free cash flow growth is positive.");
        } else if (input.freeCashFlowCagr5Y < 0) {
            score -= 2;
            notes.push("5Y free cash flow growth is negative.");
        }
    }

    return { score: clampScore(score), notes };
}

function scoreBalanceSheetHealth(input: {
    debtToAssetsLatest: number | null;
}): ScoreDetail {
    const notes: string[] = [];
    let score = 5;

    if (input.debtToAssetsLatest == null) {
        notes.push("Debt-to-assets history unavailable.");
        return { score: null, notes };
    }

    const ratio = input.debtToAssetsLatest;

    if (ratio < 0.3) {
        score = 9;
        notes.push("Debt-to-assets ratio is conservative.");
    } else if (ratio < 0.5) {
        score = 7;
        notes.push("Debt-to-assets ratio appears manageable.");
    } else if (ratio < 0.7) {
        score = 5;
        notes.push("Debt-to-assets ratio is somewhat elevated.");
    } else {
        score = 2.5;
        notes.push("Debt-to-assets ratio is high.");
    }

    return { score: clampScore(score), notes };
}

function scoreProfitabilityEfficiency(input: {
    roicLatest: number | null;
}): ScoreDetail {
    const notes: string[] = [];
    let score = 5;

    if (input.roicLatest == null) {
        notes.push("ROIC history unavailable.");
        return { score: null, notes };
    }

    const roic = input.roicLatest;

    if (roic > 0.2) {
        score = 9.5;
        notes.push("ROIC is excellent.");
    } else if (roic > 0.12) {
        score = 8;
        notes.push("ROIC is strong.");
    } else if (roic > 0.08) {
        score = 6.5;
        notes.push("ROIC is acceptable.");
    } else if (roic > 0.04) {
        score = 4.5;
        notes.push("ROIC is modest.");
    } else {
        score = 2;
        notes.push("ROIC is weak.");
    }

    return { score: clampScore(score), notes };
}

function scoreGrowthQuality(input: {
    dividendCagr5Y: number | null;
    freeCashFlowCagr5Y: number | null;
}): ScoreDetail {
    const notes: string[] = [];
    let score = 5;

    if (input.dividendCagr5Y == null && input.freeCashFlowCagr5Y == null) {
        notes.push("Growth metrics unavailable.");
        return { score: null, notes };
    }

    if (input.dividendCagr5Y != null) {
        if (input.dividendCagr5Y > 0.1) {
            score += 2;
            notes.push("Dividend growth is strong.");
        } else if (input.dividendCagr5Y > 0.04) {
            score += 1;
            notes.push("Dividend growth is positive.");
        } else if (input.dividendCagr5Y < 0) {
            score -= 2;
            notes.push("Dividend growth is negative.");
        }
    }

    if (input.freeCashFlowCagr5Y != null) {
        if (input.freeCashFlowCagr5Y > 0.1) {
            score += 2;
            notes.push("Free cash flow growth is strong.");
        } else if (input.freeCashFlowCagr5Y > 0.04) {
            score += 1;
            notes.push("Free cash flow growth is positive.");
        } else if (input.freeCashFlowCagr5Y < 0) {
            score -= 2;
            notes.push("Free cash flow growth is negative.");
        }
    }

    return { score: clampScore(score), notes };
}

export async function buildQualityAnalytics(inputSymbol: string): Promise<QualityAnalytics> {
    const unified = await buildUnifiedAnalytics(inputSymbol);

    const debtToAssetsLatest =
        unified.historyAnalytics.debtToAssets10YHistory[0]?.value ?? null;

    const roicLatest =
        unified.historyAnalytics.roic10YHistory[0]?.value ?? null;

    const dividendSafety = scoreDividendSafety({
        payoutRatioTtm: unified.dividendAnalytics.payoutRatioTtm,
    });

    const cashFlowStrength = scoreCashFlowStrength({
        freeCashFlowYield: unified.cashflowAnalytics.freeCashFlowYield,
        freeCashFlowCagr5Y: unified.cashflowAnalytics.freeCashFlowCagr5Y,
    });

    const balanceSheetHealth = scoreBalanceSheetHealth({
        debtToAssetsLatest,
    });

    const profitabilityEfficiency = scoreProfitabilityEfficiency({
        roicLatest,
    });

    const growthQuality = scoreGrowthQuality({
        dividendCagr5Y: unified.dividendAnalytics.dividendCagr5Y,
        freeCashFlowCagr5Y: unified.cashflowAnalytics.freeCashFlowCagr5Y,
    });

    const overallQualityScore = averageScores([
        dividendSafety.score,
        cashFlowStrength.score,
        balanceSheetHealth.score,
        profitabilityEfficiency.score,
        growthQuality.score,
    ]);

    return {
        symbol: unified.symbol,
        dividendSafety,
        cashFlowStrength,
        balanceSheetHealth,
        profitabilityEfficiency,
        growthQuality,
        overallQualityScore,
    };
}