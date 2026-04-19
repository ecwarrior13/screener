import {
    fetchFmpBalanceSheet,
    fetchFmpCashFlowStatement,
    fetchFmpDividends,
    fetchFmpEarnings,
    fetchFmpIncomeStatement,
    fetchFmpFinancialGrowth,
    fetchFmpRatios,
    fetchFmpRatiosTtm,
    fetchFmpFinancialScores,
    fetchFmpKeyMetrics,
    fetchFmpProfile,
    fetchFmpQuote,
} from "@/lib/fmp";
import {
    saveBalanceSheets,
    saveCashFlowStatements,
    saveEarnings,
    saveFinancialScores,
    saveFinancialGrowth,
    saveRatios,
    saveRatiosTtm,
    saveDividends,
    saveIncomeStatements,
    saveKeyMetrics,
    saveProfile,
    saveQuote,
} from "@/lib/fmprep-db";

export async function syncStockBySymbol(inputSymbol: string) {
    const symbol = inputSymbol.trim().toUpperCase();

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    const [
        quote,
        profile,
        keyMetrics,
        financialScores,
        financialGrowth,
        earnings,
        dividends,
        annualIncomeStatements,
        quarterlyIncomeStatements,
        balanceSheets,
        annualCashFlowStatements,
        quarterlyCashFlowStatements,
        ratios,
        ratiosTtm,
    ] = await Promise.all([
        fetchFmpQuote(symbol),
        fetchFmpProfile(symbol),
        fetchFmpKeyMetrics(symbol),
        fetchFmpFinancialScores(symbol),
        fetchFmpFinancialGrowth(symbol),
        fetchFmpEarnings(symbol),
        fetchFmpDividends(symbol),
        fetchFmpIncomeStatement(symbol, { period: "annual", limit: 15 }),
        fetchFmpIncomeStatement(symbol, { period: "quarter", limit: 20 }),
        fetchFmpBalanceSheet(symbol),
        fetchFmpCashFlowStatement(symbol, { period: "annual", limit: 15 }),
        fetchFmpCashFlowStatement(symbol, { period: "quarter", limit: 20 }),
        fetchFmpRatios(symbol),
        fetchFmpRatiosTtm(symbol),
    ]);

    const cashFlowStatements = [
        ...annualCashFlowStatements,
        ...quarterlyCashFlowStatements,
    ];
    const incomeStatements = [
        ...annualIncomeStatements,
        ...quarterlyIncomeStatements,
    ];

    if (!quote) {
        throw new Error(`No quote data found for symbol ${symbol}`);
    }

    await saveQuote(symbol, quote);

    if (profile) {
        await saveProfile(symbol, profile);
    }

    if (keyMetrics) {
        await saveKeyMetrics(symbol, keyMetrics);
    }

    if (financialScores) {
        await saveFinancialScores(symbol, financialScores);
    }

    if (financialGrowth.length) {
        await saveFinancialGrowth(symbol, financialGrowth);
    }

    if (earnings.length) {
        await saveEarnings(symbol, earnings);
    }

    if (dividends.length) {
        await saveDividends(symbol, dividends);
    }

    if (incomeStatements.length) {
        await saveIncomeStatements(symbol, incomeStatements);
    }

    if (balanceSheets.length) {
        await saveBalanceSheets(symbol, balanceSheets);
    }

    if (cashFlowStatements.length) {
        await saveCashFlowStatements(symbol, cashFlowStatements);
    }
    if (ratios.length) {
        await saveRatios(symbol, ratios);
    }

    if (ratiosTtm) {
        await saveRatiosTtm(symbol, ratiosTtm);
    }

    return {
        symbol,
        quote,
        profile,
        keyMetrics,
        financialScores,
        financialGrowth,
        earnings,
        dividends,
        incomeStatements,
        balanceSheets,
        cashFlowStatements,
        ratios,
        ratiosTtm,
    };
}