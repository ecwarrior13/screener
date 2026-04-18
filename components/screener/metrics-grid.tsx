import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScreenerCurrentMetrics } from "@/lib/types";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  BarChart3,
  PiggyBank,
} from "lucide-react";

interface MetricsGridProps {
  metrics: ScreenerCurrentMetrics;
}

function formatCurrency(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
}

function formatPerShare(value: number | null): string {
  if (value === null) return "N/A";
  return `$${value.toFixed(2)}`;
}

function getTrend(
  value: number | null,
): "up" | "down" | "neutral" {
  if (value === null || value === 0) {
    return "neutral";
  }

  return value > 0 ? "up" : "down";
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {trend && trend !== "neutral" && (
            <span
              className={`flex items-center text-xs font-medium ${
                trend === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-0.5" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5" />
              )}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="space-y-6">
      {/* Core Financials */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Latest Financials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Revenue"
            value={formatCurrency(metrics.revenue)}
            subtitle="Most recent fiscal year"
            icon={DollarSign}
          />
          <MetricCard
            title="Gross Profit"
            value={formatCurrency(metrics.grossProfit)}
            subtitle="Most recent fiscal year"
            icon={BarChart3}
          />
          <MetricCard
            title="Net Income"
            value={formatCurrency(metrics.netIncome)}
            subtitle="Most recent fiscal year"
            icon={PiggyBank}
          />
          <MetricCard
            title="EPS"
            value={formatPerShare(metrics.eps)}
            subtitle="Earnings per share"
            icon={DollarSign}
          />
        </div>
      </div>

      {/* CAGR Metrics */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Growth Rates (CAGR)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="5Y Revenue CAGR"
            value={formatPercent(metrics.fiveYearRevenueCagr)}
            subtitle="Compound annual growth"
            icon={TrendingUp}
            trend={getTrend(metrics.fiveYearRevenueCagr)}
          />
          <MetricCard
            title="10Y Revenue CAGR"
            value={formatPercent(metrics.tenYearRevenueCagr)}
            subtitle="Compound annual growth"
            icon={TrendingUp}
            trend={getTrend(metrics.tenYearRevenueCagr)}
          />
          <MetricCard
            title="5Y Net Income CAGR"
            value={formatPercent(metrics.fiveYearNetIncomeCagr)}
            subtitle="Compound annual growth"
            icon={TrendingUp}
            trend={getTrend(metrics.fiveYearNetIncomeCagr)}
          />
          <MetricCard
            title="10Y Net Income CAGR"
            value={formatPercent(metrics.tenYearNetIncomeCagr)}
            subtitle="Compound annual growth"
            icon={TrendingUp}
            trend={getTrend(metrics.tenYearNetIncomeCagr)}
          />
        </div>
      </div>

      {/* Profitability Ratios */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Gross Profit Ratio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Last Year GPR"
            value={formatPercent(metrics.lastYearGPR)}
            subtitle="Most recent fiscal year"
            icon={Percent}
          />
          <MetricCard
            title="5Y Avg GPR"
            value={formatPercent(metrics.fiveYearAvgGPR)}
            subtitle="5-year average"
            icon={Percent}
          />
          <MetricCard
            title="10Y Avg GPR"
            value={formatPercent(metrics.tenYearAvgGPR)}
            subtitle="10-year average"
            icon={Percent}
          />
        </div>
      </div>
    </div>
  );
}
