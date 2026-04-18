import {
    fetchFmpBalanceSheet,
    fetchFmpCashFlowStatement,
    fetchFmpDividends,
    fetchFmpIncomeStatement,
    fetchFmpKeyMetrics,
    fetchFmpProfile,
    fetchFmpQuote,
} from "@/lib/fmp";
import {
    saveBalanceSheets,
    saveCashFlowStatements,
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
        dividends,
        incomeStatements,
        balanceSheets,
        cashFlowStatements,
    ] = await Promise.all([
        fetchFmpQuote(symbol),
        fetchFmpProfile(symbol),
        fetchFmpKeyMetrics(symbol),
        fetchFmpDividends(symbol),
        fetchFmpIncomeStatement(symbol),
        fetchFmpBalanceSheet(symbol),
        fetchFmpCashFlowStatement(symbol),
    ]);

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

    return {
        symbol,
        quote,
        profile,
        keyMetrics,
        dividends,
        incomeStatements,
        balanceSheets,
        cashFlowStatements,
    };
}