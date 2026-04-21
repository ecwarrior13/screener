import { NextResponse } from "next/server";
import { buildUnifiedAnalytics } from "@/lib/analytics/services/unified-analytics-service";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;
        const analytics = await buildUnifiedAnalytics(symbol);

        return NextResponse.json(analytics);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}