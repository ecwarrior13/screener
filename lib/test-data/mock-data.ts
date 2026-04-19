function generateCashFlowData(ticker: string) {
    const baseMultiplier = ticker.length * 7 + 42
    const currentYear = new Date().getFullYear()

    // Generate 10-year history
    const history = Array.from({ length: 10 }, (_, i) => {
        const year = currentYear - 9 + i
        const growthFactor = 1 + (i * 0.08) + (Math.random() * 0.1 - 0.05)
        const baseRevenue = baseMultiplier * 2.5 * growthFactor
        const baseShares = (baseMultiplier * 0.15) * (1 - i * 0.015) // Shares decreasing over time (buybacks)
        const baseFCF = baseMultiplier * 0.8 * growthFactor
        const baseAssets = baseMultiplier * 8 * growthFactor
        const baseDebt = baseMultiplier * 1.5 * (1 + Math.random() * 0.3)

        return {
            year,
            eps: Number((baseMultiplier * 0.04 * growthFactor).toFixed(2)),
            sharesOutstanding: Number((baseShares * 1000).toFixed(0)), // in millions
            revenuePerShare: Number((baseRevenue / baseShares).toFixed(2)),
            debtToAssets: Number(((baseDebt / baseAssets) * 100).toFixed(1)),
            fcfPerShare: Number((baseFCF / baseShares).toFixed(2)),
            roic: Number((8 + i * 0.8 + Math.random() * 3).toFixed(1)),
        }
    })

    const latestYear = history[history.length - 1]
    const stockPrice = latestYear.eps * (15 + Math.random() * 10)

    // TTM metrics
    const fcfTTM = latestYear.fcfPerShare * latestYear.sharesOutstanding // in millions
    const fcfPerShareTTM = latestYear.fcfPerShare
    const fcfYield = (fcfPerShareTTM / stockPrice) * 100

    // Dividend data
    const payoutRatio = 20 + Math.random() * 30
    const dividend = latestYear.eps * (payoutRatio / 100)
    const dividendYield = (dividend / stockPrice) * 100

    return {
        ticker,
        stockPrice,
        fcfTTM,
        fcfPerShareTTM,
        fcfYield,
        dividend,
        dividendYield,
        payoutRatio,
        history,
    }
}

export type CashFlowData = ReturnType<typeof generateCashFlowData>