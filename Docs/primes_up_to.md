# `primesUpTo`

Returns every prime number less than or equal to a limit.

## Version history

- **`0.2.5`** — Reuses each base prime's square within sieve marking
 instead of recalculating it in the same loop.
- **`0.2.1`** — Raises the supported limit to `1_000_000_000` while keeping
 temporary sieve memory bounded by fixed-size segments.
- **`0.2.1`** — Uses odd-only segmented buffers and skips even candidate
 marking and scanning.
- **`0.2.1`** — Removes per-segment initialization and uses safe bitwise index
 arithmetic in hot loops.
- **`0.2.0`** — Added `primesUpTo` using an odd-only base sieve and segmented
 marking.

## Signature

```ts
primesUpTo(limit: number): number[]
```

## Parameters

- `limit` — A safe integer from `0` through `1_000_000_000`.

## Returns

Returns primes in ascending order. A limit below `2` returns an empty array.

## Errors

Throws `RangeError` for negative, fractional, non-finite, unsafe, or larger
than `1_000_000_000` limits.

## Examples

```ts
import { primesUpTo } from "numwise";

primesUpTo(10); // [2, 3, 5, 7]
```

## Algorithm and performance

An odd-only sieve generates base primes through `sqrt(limit)`. The result is
then marked in larger fixed-size segments containing only odd candidates, so
even numbers are neither stored nor scanned. Runtime is $O(n \log\log n)$
with output storage proportional to the number of primes and a bounded
temporary buffer. Large limits can require substantial memory for the
returned prime array; the segment buffer itself remains bounded.
