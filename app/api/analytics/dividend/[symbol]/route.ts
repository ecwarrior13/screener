import { NextResponse } from "next/server";
import { buildDividendAnalytics } from "@/lib/analytics/services/dividend-analytics-service";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;
        const analytics = await buildDividendAnalytics(symbol);

        return NextResponse.json(analytics);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}