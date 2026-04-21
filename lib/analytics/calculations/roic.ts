export function calculateRoic(
    operatingIncome: number | null,
    totalDebt: number | null,
    totalEquity: number | null
): number | null {
    if (
        operatingIncome == null ||
        totalDebt == null ||
        totalEquity == null
    ) {
        return null;
    }

    const investedCapital = totalDebt + totalEquity;

    if (investedCapital <= 0) {
        return null;
    }

    const nopat = operatingIncome * 0.79;

    return nopat / investedCapital;
}