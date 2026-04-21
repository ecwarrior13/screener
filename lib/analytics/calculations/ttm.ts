export function sumLastNValues(
    values: Array<number | null | undefined>,
    count: number
): number | null {
    if (values.length < count) {
        return null;
    }

    const total = values.slice(0, count).reduce((sum, value) => {
        return sum + Number(value ?? 0);
    }, 0);

    return total;
}