import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DividendHistoricalRow } from "@/lib/types";

interface DividendHistoryProps {
  history: DividendHistoricalRow[];
}

function formatCurrencyCompact(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  }

  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }

  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }

  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(1)}%`;
}

function formatPerShare(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return `$${value.toFixed(2)}`;
}

export function DividendHistory({ history }: DividendHistoryProps) {
  const sortedHistory = [...history].sort((a, b) => b.year - a.year);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold text-foreground">
                Year
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Free Cash Flow
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Total Dividends
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                FCF Payout Ratio
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Adj. Dividend
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Payout Ratio
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {sortedHistory.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No saved dividend history found.
                  </TableCell>
                </TableRow>
              )}
              {sortedHistory.map((row, index) => (
                <TableRow
                  key={row.year}
                  className={
                    index === 0
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/50"
                  }
                >
                  <TableCell className="font-medium text-foreground">
                    {row.year}
                    {index === 0 && (
                      <span className="ml-2 text-xs text-primary">
                        (Latest)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrencyCompact(row.freeCashFlow)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrencyCompact(row.totalDividendsPaid)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-mono ${
                        row.fcfPayoutRatio === null
                          ? "text-muted-foreground"
                          : row.fcfPayoutRatio > 80
                          ? "text-destructive"
                          : row.fcfPayoutRatio > 60
                            ? "text-amber-600"
                            : "text-success"
                      }`}
                    >
                      {formatPercent(row.fcfPayoutRatio)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatPerShare(row.adjustedDividend)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-mono ${
                        row.payoutRatio === null
                          ? "text-muted-foreground"
                          : row.payoutRatio > 70
                          ? "text-destructive"
                          : row.payoutRatio > 50
                            ? "text-amber-600"
                            : "text-success"
                      }`}
                    >
                      {formatPercent(row.payoutRatio)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      {/* Legend */}
      <div className="border-t border-border px-4 py-3 bg-muted/30">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Healthy (&lt;50% payout)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            Moderate (50-70% payout)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            High (&gt;70% payout)
          </span>
        </div>
      </div>
    </div>
  );
}
