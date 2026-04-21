export function safeDivide(
    numerator: number | null | undefined,
    denominator: number | null | undefined
): number | null {
    if (numerator == null || denominator == null || denominator <= 0) {
        return null;
    }

    return numerator / denominator;
}