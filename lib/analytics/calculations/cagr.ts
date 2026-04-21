export function calculateCagr(
    startValue: number,
    endValue: number,
    years: number
): number | null {
    if (startValue <= 0 || endValue <= 0 || years <= 0) {
        return null;
    }

    return Math.pow(endValue / startValue, 1 / years) - 1;
}