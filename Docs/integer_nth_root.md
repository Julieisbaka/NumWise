# `integerNthRoot`

Returns the exact integer floor of an n-th root.

## Version history

- **`0.2.7`** — Uses a floating-point root estimate to start arbitrary-
 degree Newton iteration closer to the exact root while retaining exact BigInt
 correction for rounding errors.
- **`0.2.5`** — Uses Number loop counters and multiply-then-cap checks in
 arbitrary-degree power comparisons, reducing BigInt division and counter work.
- **`0.2.5`** — Reuses cached square and cube values with exact neighboring-
 power identities during cube-root correction, avoiding repeated cube
 multiplications.
- **`0.2.2`** — Computes degree `3` entirely in `number` arithmetic, clamping
 the estimate to `208,063` so every correction cube stays exactly
 representable.
- **`0.2.2`** — Reduces composite degrees through nested exact floor roots, so
 even degrees repeat the square-root path and multiples of three repeat the
 cube-root path instead of running arbitrary-precision iteration.
- **`0.2.2`** — Returns `1` immediately for degrees at least `53`, since all
 supported values are below $2^{53}$; this keeps large-degree correction
 bounded instead of iterating once per degree.
- **`0.2.2`** — Uses the exact `integerSqrt` path for degree `2`.
- **`0.2.0`** — Added exact Newton iteration with perfect-power correction.

## Signature

```ts
integerNthRoot(value: number, n: number): number
```

## Parameters

- `value` — A non-negative safe integer.
- `n` — A positive safe integer degree.

## Returns

Returns the greatest integer `r` such that $r^n \leq value$. Perfect powers
are returned exactly and non-perfect powers are floored.

## Errors

Throws `RangeError` for an invalid value or a degree less than `1`.

## Examples

```ts
import { integerNthRoot } from "numwise";

integerNthRoot(64, 3); // 4
integerNthRoot(65, 3); // 4
integerNthRoot(25, 2); // 5
```

## Algorithm and performance

Degree `2` uses `integerSqrt` and degree `3` uses a `Math.cbrt` estimate with
exact `number` corrections. Because nested exact floor roots compose, any even
degree reduces to a square root of a smaller problem and any multiple of three
reduces to a cube root, so only degrees coprime to six reach the
arbitrary-precision path. That path uses integer Newton iteration with bounded
exact power comparisons, starting from a `Math.pow` estimate and correcting
any floating-point estimate error exactly. It detects perfect powers without
unsafe `number` multiplication. Degrees at least `53` use the exact
safe-integer bound to return `1` directly. Auxiliary arithmetic uses constant
space.
