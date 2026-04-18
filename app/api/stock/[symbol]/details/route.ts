import { NextResponse } from "next/server";
import { getStockDetailsBySymbol } from "@/lib/stock-read-service";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;

        const details = await getStockDetailsBySymbol(symbol);

        return NextResponse.json(details);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong";

        if (message.includes("No saved quote found")) {
            return NextResponse.json({ error: message }, { status: 404 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}