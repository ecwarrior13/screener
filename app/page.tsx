"use client";

import { useState } from "react";
import type { SavedQuote, StockDetails } from "@/lib/types";

export default function HomePage() {
  const [symbol, setSymbol] = useState("");
  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<StockDetails | null>(
    null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  async function loadSavedQuotes() {
    setLoadingList(true);

    try {
      const response = await fetch("/api/stocks");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load saved stocks");
      }

      setSavedQuotes(data.quotes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingList(false);
    }
  }

  async function loadStockDetails(symbol: string) {
    setLoadingDetails(true);
    setError("");

    try {
      const response = await fetch(`/api/stock/${symbol}/details`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load stock details");
      }

      setSelectedDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleFetchStock() {
    setLoading(true);
    setError("");
    setQuote(null);

    try {
      const cleanSymbol = symbol.trim().toUpperCase();

      if (!cleanSymbol) {
        throw new Error("Please enter a stock symbol");
      }

      const syncResponse = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: cleanSymbol }),
      });

      const syncData = await syncResponse.json();

      if (!syncResponse.ok) {
        throw new Error(syncData.error || "Failed to sync stock");
      }

      const dbResponse = await fetch(`/api/stock/${cleanSymbol}`, {
        method: "GET",
      });

      const dbData = await dbResponse.json();

      if (!dbResponse.ok) {
        throw new Error(dbData.error || "Failed to load saved stock");
      }

      setQuote(dbData.quote);
      setSymbol("");

      await loadSavedQuotes();
      await loadStockDetails(cleanSymbol);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <section className="space-y-6">
        <h1 className="text-2xl font-bold">Stock Lookup</h1>

        <div className="flex gap-2">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter ticker like AAPL"
            className="flex-1 rounded-md border px-3 py-2"
          />
          <button
            onClick={handleFetchStock}
            disabled={loading}
            className="rounded-md border px-4 py-2"
          >
            {loading ? "Loading..." : "Fetch"}
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {quote && (
          <div className="space-y-2 rounded-md border p-4">
            <p>
              <strong>Symbol:</strong> {quote.symbol}
            </p>
            <p>
              <strong>Name:</strong> {quote.name}
            </p>
            <p>
              <strong>Price:</strong> {quote.price}
            </p>
            <p>
              <strong>Change:</strong> {quote.change}
            </p>
            <p>
              <strong>Volume:</strong> {quote.volume}
            </p>
            <p>
              <strong>Fetched At:</strong>{" "}
              {new Date(quote.fetched_at).toLocaleString()}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Saved Stocks</h2>
          <button
            onClick={loadSavedQuotes}
            disabled={loadingList}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {loadingList ? "Refreshing..." : "Refresh List"}
          </button>
        </div>

        {savedQuotes.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-gray-500">
            No saved stocks yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Change</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {savedQuotes.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-b last:border-b-0 hover:bg-gray-50"
                    onClick={() => loadStockDetails(item.symbol)}
                  >
                    <td className="px-3 py-2 font-medium">{item.symbol}</td>
                    <td className="px-3 py-2">{item.name ?? "—"}</td>
                    <td className="px-3 py-2">{item.price ?? "—"}</td>
                    <td className="px-3 py-2">{item.change ?? "—"}</td>
                    <td className="px-3 py-2">
                      {new Date(item.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Selected Stock Details</h2>

        {loadingDetails && (
          <div className="rounded-md border p-4 text-sm text-gray-500">
            Loading details...
          </div>
        )}

        {!loadingDetails && !selectedDetails && (
          <div className="rounded-md border p-4 text-sm text-gray-500">
            Click a saved stock row to load its saved quote, profile, and key
            metrics.
          </div>
        )}

        {!loadingDetails && selectedDetails && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border p-4 space-y-2">
              <h3 className="font-semibold">Quote</h3>
              <p>
                <strong>Symbol:</strong> {selectedDetails.quote?.symbol ?? "—"}
              </p>
              <p>
                <strong>Name:</strong> {selectedDetails.quote?.name ?? "—"}
              </p>
              <p>
                <strong>Price:</strong> {selectedDetails.quote?.price ?? "—"}
              </p>
              <p>
                <strong>Change:</strong> {selectedDetails.quote?.change ?? "—"}
              </p>
              <p>
                <strong>Volume:</strong> {selectedDetails.quote?.volume ?? "—"}
              </p>
            </div>

            <div className="rounded-md border p-4 space-y-2">
              <h3 className="font-semibold">Profile</h3>
              <p>
                <strong>Company:</strong>{" "}
                {selectedDetails.profile?.company_name ?? "—"}
              </p>
              <p>
                <strong>Exchange:</strong>{" "}
                {selectedDetails.profile?.exchange ?? "—"}
              </p>
              <p>
                <strong>Industry:</strong>{" "}
                {selectedDetails.profile?.industry ?? "—"}
              </p>
              <p>
                <strong>Sector:</strong>{" "}
                {selectedDetails.profile?.sector ?? "—"}
              </p>
            </div>

            <div className="rounded-md border p-4 space-y-2">
              <h3 className="font-semibold">Key Metrics</h3>
              <p>
                <strong>Market Cap:</strong>{" "}
                {selectedDetails.keyMetrics?.market_cap ?? "—"}
              </p>
              <p>
                <strong>P/E Ratio:</strong>{" "}
                {selectedDetails.keyMetrics?.pe_ratio ?? "—"}
              </p>
              <p>
                <strong>P/B Ratio:</strong>{" "}
                {selectedDetails.keyMetrics?.pb_ratio ?? "—"}
              </p>
              <p>
                <strong>Dividend Yield:</strong>{" "}
                {selectedDetails.keyMetrics?.dividend_yield ?? "—"}
              </p>
              <p>
                <strong>Current Ratio:</strong>{" "}
                {selectedDetails.keyMetrics?.current_ratio ?? "—"}
              </p>
            </div>
            <div className="rounded-md border p-4 space-y-2">
              <h3 className="font-semibold">Dividends</h3>

              {selectedDetails.dividends.length === 0 ? (
                <p>—</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {selectedDetails.dividends.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-1 last:border-b-0"
                    >
                      <span>{item.dividend_date}</span>
                      <span>{item.dividend ?? "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
