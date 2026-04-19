import { Card, CardContent } from "@/components/ui/card";
import { Coins, Percent, PieChart } from "lucide-react";
import type { DividendStockData } from "@/lib/types";

interface DividendDataProps {
  data: DividendStockData;
}

function formatDividend(value: number | null): string {
  if (value === null) return "N/A";
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}

export function DividendData({ data }: DividendDataProps) {
  const { currentMetrics } = data;
  const metrics = [
    {
      label: "Annual Dividend",
      value: formatDividend(currentMetrics.annualDividend),
      icon: Coins,
      description: "Dividend per share (annual)",
    },
    {
      label: "Dividend Yield",
      value: formatPercent(currentMetrics.dividendYield),
      icon: Percent,
      description: "Annual dividend / stock price",
      highlight:
        currentMetrics.dividendYield !== null && currentMetrics.dividendYield > 2.5,
    },
    {
      label: "Payout Ratio",
      value: formatPercent(currentMetrics.payoutRatio),
      icon: PieChart,
      description: "Dividend / EPS",
      warning:
        currentMetrics.payoutRatio !== null && currentMetrics.payoutRatio > 70,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    metric.warning
                      ? "text-destructive"
                      : metric.highlight
                        ? "text-success"
                        : "text-foreground"
                  }`}
                >
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
