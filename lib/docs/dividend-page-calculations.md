# Dividend Page Data Flow And Calculations

This document describes how `app/dividend/page.tsx` builds the dividend page from saved database data.

## Request Flow

1. The page calls `fetch("/api/stock/[symbol]/details")` after the user searches for a ticker.
2. The route handler in [app/api/stock/[symbol]/details/route.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/api/stock/[symbol]/details/route.ts:4) calls `getStockDetailsBySymbol(symbol)`.
3. `getStockDetailsBySymbol` in [lib/stock-read-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-read-service.ts:6) reads the saved quote, profile, key metrics, dividends, income statements, and cash flow statements.
4. `app/dividend/page.tsx` derives the display model `DividendStockData` from those saved rows.

## Database Tables Used

The page depends on these saved tables:

- `fmprep_quotes`
  - Used for `quote.price` and fallback display name.
  - Read in [lib/stock-read-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-read-service.ts:21).
- `fmprep_profiles`
  - Used for `profile.company_name`.
  - Read in [lib/stock-read-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-read-service.ts:27).
- `fmprep_dividends`
  - Used for individual dividend payments.
  - Read in [lib/stock-dividends-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-dividends-service.ts:10).
- `fmprep_income_statements`
  - Used for annual EPS, which feeds payout ratio.
  - Read in [lib/stock-income-statements-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-income-statements-service.ts:10).
- `fmprep_cash_flow_statements`
  - Used for annual free cash flow and dividends paid in the history table.
  - Used for the current FCF payout ratio TTM from the last 4 quarterly rows.
  - Read in [lib/stock-cash-flow-statements-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-cash-flow-statements-service.ts:10).

`fmprep_key_metrics` is also read by `getStockDetailsBySymbol`, but the current dividend page does not use it directly.

## Queries Used

The read layer uses Supabase queries equivalent to these SQL-style lookups:

### Quote

```sql
select *
from fmprep_quotes
where symbol = :symbol
limit 1;
```

Implementation: [lib/stock-read-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-read-service.ts:21)

### Profile

```sql
select *
from fmprep_profiles
where symbol = :symbol
limit 1;
```

Implementation: [lib/stock-read-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-read-service.ts:27)

### Key Metrics

```sql
select *
from fmprep_key_metrics
where symbol = :symbol
limit 1;
```

Implementation: [lib/stock-read-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-read-service.ts:33)

### Dividends

```sql
select *
from fmprep_dividends
where symbol = :symbol
order by dividend_date desc;
```

Implementation: [lib/stock-dividends-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-dividends-service.ts:10)

### Income Statements

```sql
select *
from fmprep_income_statements
where symbol = :symbol
order by statement_date desc;
```

Implementation: [lib/stock-income-statements-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-income-statements-service.ts:10)

### Cash Flow Statements

```sql
select *
from fmprep_cash_flow_statements
where symbol = :symbol
order by statement_date desc;
```

Implementation: [lib/stock-cash-flow-statements-service.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/stock-cash-flow-statements-service.ts:10)

## Saved Fields Used By The Page

The runtime types are defined in [lib/types.ts](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/lib/types.ts:83).

Fields consumed by the dividend page:

- Quote
  - `price`
  - `name`
- Profile
  - `company_name`
- Dividends
  - `dividend_date`
  - `dividend`
- Income statements
  - `statement_date`
  - `period`
  - `fiscal_year`
  - `eps`
- Cash flow statements
  - `statement_date`
  - `period`
  - `fiscal_year`
  - `free_cash_flow`
  - `dividends_paid`

## Transformation Steps

The transformation logic lives in [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:20).

### 1. Filter To Annual Statements

Only annual statement rows are used for income statements and cash flow statements.

Rule:

```ts
!statement.period || statement.period.toUpperCase() === "FY"
```

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:20)

### 2. Resolve Statement Year

For statement rows, the page uses:

1. `fiscal_year`, if present and parseable
2. Otherwise the first four characters of `statement_date`

For dividend rows, the year comes from the first four characters of `dividend_date`.

Implementation:

- [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:26)
- [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:44)

### 3. Build Annual Dividend Totals

All dividend payments in the same calendar year are summed into one annual dividend per share.

Formula:

```text
annual_dividend_per_share(year) = sum(dividend for all rows in that year)
```

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:79)

### 4. Build One Statement Row Per Year

Income statements and cash flow statements are sorted by `statement_date` ascending, then stored in a `Map<year, row>`.

Because later inserts overwrite earlier entries for the same year, the final row kept for a year is the last eligible row in date order.

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:99)

### 5. Build Historical Dividend Rows

The page unions all years that appear in:

- annual dividend totals
- annual income statements
- annual cash flow statements

For each year it creates:

- `freeCashFlow = cashFlowStatement.free_cash_flow ?? null`
- `totalDividendsPaid = abs(cashFlowStatement.dividends_paid)` when present
- `adjustedDividend = annualDividendMap.get(year) ?? null`
- `fcfPayoutRatio = totalDividendsPaid / freeCashFlow * 100`
- `payoutRatio = adjustedDividend / eps * 100`

Rows with every metric null are dropped. The page keeps the full derived history for calculations, then displays only the last 10 years in the UI table.

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:124)

## Metric Calculations

### Company Name

Formula:

```text
company_name = profile.company_name ?? quote.name ?? null
```

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:265)

### Stock Price

Formula:

```text
stock_price = quote.price ?? null
```

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:268)

### Latest Dividend

The page picks the most recent dividend row with a non-null `dividend`, sorted by `dividend_date desc`.

Formula:

```text
latest_dividend = most recent non-null dividend row
```

Displayed values:

- `latestDividend = latest_dividend.dividend`
- `latestDividendDate = latest_dividend.dividend_date`, formatted for UI

Implementation:

- [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:172)
- [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:219)

### Annual Dividend

This is a trailing-12-month sum anchored to the latest dividend date, not the current calendar year total.

Steps:

1. Find the latest dividend row.
2. Build a one-year lookback window ending on that date.
3. Sum all dividend amounts where:
   - `dividend_date > windowStart`
   - `dividend_date <= latestDividendDate`

Formula:

```text
annual_dividend =
  sum(dividend within trailing 12 months ending at latest dividend date)
```

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:178)

### Dividend Yield

Formula:

```text
dividend_yield = annual_dividend / stock_price * 100
```

Guard:

- Returns `null` if annual dividend is null, stock price is null, or stock price <= 0.

Implementation:

- Helper: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:50)
- Usage: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:270)

### Payout Ratio

This comes from the latest historical row whose computed `payoutRatio` is non-null.

Per-year formula:

```text
payout_ratio(year) = adjusted_dividend(year) / eps(year) * 100
```

Current card formula:

```text
current_payout_ratio = latest non-null payout_ratio(year)
```

Guard:

- Returns `null` if dividend is null, EPS is null, or EPS <= 0.

Implementation:

- Per-year history: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:152)
- Latest non-null selection: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:205)
- Final current metric: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:274)

### FCF Payout Ratio TTM

The current card is calculated from the last 4 quarterly cash flow statements, not from the annual history table.

Quarter filter:

```text
period in ('Q1', 'Q2', 'Q3', 'Q4')
```

Quarter selection:

1. Filter to quarterly rows
2. Sort by `statement_date desc`
3. Take the latest 4 rows

Formulas:

```text
fcf_ttm = sum(last_4_quarters.free_cash_flow)

dividends_paid_ttm =
  sum(abs(last_4_quarters.dividends_paid))

fcf_payout_ratio_ttm =
  dividends_paid_ttm / fcf_ttm * 100
```

Guards:

- Returns `null` if fewer than 4 quarterly rows exist
- Returns `null` if any of the 4 rows has null `free_cash_flow`
- Returns `null` if any of the 4 rows has null `dividends_paid`
- Returns `null` if `fcf_ttm <= 0`

Implementation:

- Quarterly filter and TTM calculation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:26)
- TTM helper: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:205)
- Final current metric: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:278)

### Annual FCF Payout Ratio In History

The history table still uses annual cash flow rows.

Per-year formula:

```text
fcf_payout_ratio(year) = total_dividends_paid(year) / free_cash_flow(year) * 100
```

Where:

```text
total_dividends_paid(year) = abs(cash_flow_statement.dividends_paid)
```

Implementation: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:124)

### Dividend CAGR

The page first takes history rows with positive `adjustedDividend` from the full derived history. It then uses:

- the latest completed calendar-year row
- the row where `year === latest.year - 5` for 5Y CAGR
- the row where `year === latest.year - 10` for 10Y CAGR

Formula:

```text
dividend_cagr = ((end / start) ^ (1 / year_span) - 1) * 100
```

Where:

- `end = adjustedDividend` from the latest completed calendar-year row
- `start = adjustedDividend` from the exact year anchor row
- `year_span = latest.year - prior.year`

Guards:

- Returns `null` if there is no completed calendar-year dividend row
- Returns `null` if the exact anchor year does not exist
- Returns `null` if start/end is null
- Returns `null` if start <= 0 or end <= 0
- Returns `null` if year span <= 0

Implementation:

- Helper: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:61)
- Row selection: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:243)
- 5Y metric: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:279)
- 10Y metric: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:287)

### FCF CAGR

The page applies the same completed-year exact-anchor logic to rows with positive `freeCashFlow` from the full derived history.

Formula:

```text
fcf_cagr = ((end / start) ^ (1 / year_span) - 1) * 100
```

Where:

- `end = freeCashFlow` from the latest completed calendar-year row
- `start = freeCashFlow` from the exact anchor year row

Guards:

- Returns `null` if there is no completed calendar-year FCF row
- Returns `null` if the exact anchor year does not exist
- Returns `null` if start/end is null
- Returns `null` if start <= 0 or end <= 0
- Returns `null` if year span <= 0

Implementation:

- Row selection: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:244)
- 5Y metric: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:295)
- 10Y metric: [app/dividend/page.tsx](/c:/Users/MA/Documents/Web3/aisemble/aisemblework/app/dividend/page.tsx:303)

## Null And Guard Behavior

The page intentionally returns `null` instead of forcing numbers when source data is incomplete.

Common guard rules:

- Ratios return `null` if denominator is missing or `<= 0`
- CAGR returns `null` if:
  - either endpoint is missing
  - either endpoint is `<= 0`
  - year span is `<= 0`
- Annual history only includes rows where at least one derived metric is non-null

This is why the UI can display `N/A` for some symbols while still rendering the rest of the page.

## Notes And Caveats

- Dividend totals are grouped by calendar year because the source table only stores `dividend_date`, not a fiscal-year key.
- Income statements and cash flow statements are filtered to annual rows only.
- If multiple annual statement rows exist for the same year, the last row in ascending `statement_date` order wins.
- `dividends_paid` is converted with `Math.abs(...)` before payout ratio calculation because cash flow data is commonly stored as a negative cash outflow.
- `fmprep_key_metrics` is fetched but not currently used by the dividend page.
- The page fails with a user-facing error if there is no saved quote, or if both dividend and historical cash-flow/dividend data are missing.
