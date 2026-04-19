import { Card, CardContent } from "@/components/ui/card";
import type { DividendStockData } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  PiggyBank,
} from "lucide-react";

interface DividendMetricsProps {
  data: DividendStockData;
}

function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}

function formatDividend(value: number | null): string {
  if (value === null) return "N/A";
  return `$${value.toFixed(4)}`;
}

function getTrendClasses(value: number | null) {
  if (value === null) {
    return {
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
      icon: TrendingDown,
    };
  }

  return value >= 0
    ? {
        bgClass: "bg-success/10",
        textClass: "text-success",
        icon: TrendingUp,
      }
    : {
        bgClass: "bg-destructive/10",
        textClass: "text-destructive",
        icon: TrendingDown,
      };
}

export function DividendMetrics({ data }: DividendMetricsProps) {
  const { currentMetrics } = data;
  const metrics = [
    {
      label: "Dividend Yield",
      value: formatPercent(currentMetrics.dividendYield),
      icon: Percent,
      highlight:
        currentMetrics.dividendYield !== null && currentMetrics.dividendYield >= 2.5,
      highlightColor: "text-success",
    },
    {
      label: "Payout Ratio",
      value: formatPercent(currentMetrics.payoutRatio),
      icon: PiggyBank,
      highlight:
        currentMetrics.payoutRatio !== null && currentMetrics.payoutRatio > 70,
      highlightColor: "text-destructive",
    },
    {
      label: "Latest Dividend",
      value: formatDividend(currentMetrics.latestDividend),
      subValue: currentMetrics.latestDividendDate ?? undefined,
      icon: DollarSign,
    },
    {
      label: "FCF Payout Ratio TTM",
      value: formatPercent(currentMetrics.fcfPayoutRatio),
      icon: Calendar,
      highlight:
        currentMetrics.fcfPayoutRatio !== null &&
        currentMetrics.fcfPayoutRatio > 80,
      highlightColor: "text-destructive",
    },
  ];

  const cagrMetrics = [
    {
      label: "5-Year Dividend CAGR",
      value: currentMetrics.dividendCagr5,
    },
    {
      label: "10-Year Dividend CAGR",
      value: currentMetrics.dividendCagr10,
    },
    {
      label: "5-Year FCF CAGR",
      value: currentMetrics.fcfCagr5,
    },
    {
      label: "10-Year FCF CAGR",
      value: currentMetrics.fcfCagr10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      metric.highlight
                        ? metric.highlightColor
                        : "text-foreground"
                    }`}
                  >
                    {metric.value}
                  </p>
                  {metric.subValue && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {metric.subValue}
                    </p>
                  )}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CAGR Section */}
      <div className="rounded-xl bg-card border border-border p-6">
        <h4 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">
          Growth Rates (CAGR)
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cagrMetrics.map((metric) => {
            const trend = getTrendClasses(metric.value);
            const TrendIcon = trend.icon;

            return (
              <div key={metric.label} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${trend.bgClass}`}
                >
                  <TrendIcon className={`h-5 w-5 ${trend.textClass}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className={`text-lg font-bold ${trend.textClass}`}>
                    {metric.value === null
                      ? "N/A"
                      : `${metric.value >= 0 ? "+" : ""}${metric.value.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
