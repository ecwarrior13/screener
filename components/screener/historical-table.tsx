import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScreenerHistoricalRow } from "@/lib/types";
import { History } from "lucide-react";

interface HistoricalTableProps {
  data: ScreenerHistoricalRow[];
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

export function HistoricalTable({ data }: HistoricalTableProps) {
  // Sort by year descending (most recent first)
  const sortedData = [...data].sort((a, b) => b.year - a.year);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <History className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              10-Year Historical Data
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Annual financial metrics
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold w-20">
                  Year
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  Revenue
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  Gross Profit
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  Net Income
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  EPS
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">
                  GP Ratio
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 && (
                <TableRow className="border-border">
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No historical income statement data found.
                  </TableCell>
                </TableRow>
              )}
              {sortedData.map((row, index) => (
                <TableRow
                  key={row.year}
                  className={`border-border ${
                    index === 0
                      ? "bg-primary/5 font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <TableCell className="font-medium text-foreground">
                    {row.year}
                    {index === 0 && (
                      <span className="ml-2 text-xs text-primary font-semibold">
                        Latest
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-foreground tabular-nums">
                    {formatCurrency(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right text-foreground tabular-nums">
                    {formatCurrency(row.grossProfit)}
                  </TableCell>
                  <TableCell className="text-right text-foreground tabular-nums">
                    {formatCurrency(row.netIncome)}
                  </TableCell>
                  <TableCell className="text-right text-foreground tabular-nums">
                    {formatPerShare(row.eps)}
                  </TableCell>
                  <TableCell className="text-right text-foreground tabular-nums">
                    {formatPercent(row.grossProfitRatio)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
