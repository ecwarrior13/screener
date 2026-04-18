import { NextResponse } from "next/server";
import { z } from "zod";
import { syncStockBySymbol } from "@/lib/stock-sync-service";

const bodySchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const parsed = bodySchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid symbol" },
                { status: 400 }
            );
        }

        const result = await syncStockBySymbol(parsed.data.symbol);

        return NextResponse.json({
            stock: result.quote,
            profileSaved: !!result.profile,
            keyMetricsSaved: !!result.keyMetrics,
            dividendsSaved: result.dividends.length > 0,
            incomeStatementsSaved: result.incomeStatements.length > 0,
            balanceSheetsSaved: result.balanceSheets.length > 0,
            cashFlowStatementsSaved: result.cashFlowStatements.length > 0,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong";

        if (message.includes("No quote data found")) {
            return NextResponse.json({ error: message }, { status: 404 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}