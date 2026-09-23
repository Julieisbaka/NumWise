# `combination`

## Version history

- **`0.2.7`** — Reuses the optimized validated GCD core during factor
 cancellation instead of maintaining duplicate Euclidean loops.
- **`0.2.2`** — Uses the direct exact recurrence before entering factor
 cancellation, avoiding redundant GCD work for safely small intermediates.
- **`0.1.5`** — Seeds the exact fallback from the already-computed prefix so overflow-safe results do not restart the multiplicative calculation.
- **`0.1.2`** — Added `combination`.

Computes the binomial coefficient $\binom{n}{k}$ exactly without calculating full factorials.

## Signature

```ts
combination(n: number, k: number): number
```

## Parameters

- `n` — A non-negative safe integer.
- `k` — A non-negative safe integer no greater than `n`.

## Returns

Returns the exact number of ways to choose `k` items from `n` items.

The result is `1` when `k` is `0` or `n`. The function throws if the exact result exceeds `Number.MAX_SAFE_INTEGER` rather than returning an inaccurate value.

## Errors

Throws `RangeError` when:

- `n` or `k` is negative
- `k` is greater than `n`
- Either argument is fractional, `NaN`, infinite, or outside the safe-integer range
- The exact result cannot be represented as a safe integer

## Examples

```ts
import { combination } from "numwise";

combination(5, 2); // 10
combination(52, 5); // 2598960
combination(30, 27); // 4060
```

## Algorithm and performance

The implementation uses the symmetry $\binom{n}{k} = \binom{n}{n-k}$ to minimize iterations, then calculates the result with multiplicative accumulation. Factors are cancelled before multiplication to avoid unnecessary intermediate overflow. If a safe final result would still require an unsafe intermediate product, an exact `BigInt` fallback is used; results exceeding `Number.MAX_SAFE_INTEGER` are rejected.

The common path uses $O(\min(k, n-k))$ time and $O(1)$ additional space. The exact fallback also uses constant additional space relative to the input.
