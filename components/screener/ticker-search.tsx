"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TickerSearchProps {
  onSearch: (ticker: string) => void | Promise<void>;
  isLoading: boolean;
}

export function TickerSearch({ onSearch, isLoading }: TickerSearchProps) {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      void onSearch(ticker.trim());
    }
  };

  const popularTickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"];

  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="pl-10 h-12 text-base bg-background"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!ticker.trim() || isLoading}
          className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Searching..." : "Analyze"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Popular:</span>
        {popularTickers.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTicker(t);
              void onSearch(t);
            }}
            disabled={isLoading}
            className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
