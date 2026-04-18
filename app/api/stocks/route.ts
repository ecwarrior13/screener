import { NextResponse } from "next/server";
import { getSavedQuotes } from "@/lib/stock-list-service";

export async function GET() {
    try {
        const quotes = await getSavedQuotes();

        return NextResponse.json({ quotes });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}