# `lcm`

Computes the least common multiple of two safe integers exactly when the result fits the safe-integer range.

## Version history

- **`0.2.7`** — Divides by the exact GCD before multiplication, removing the
 pre-multiplication product-bound check while preserving safe-result detection.
- **`0.2.3`** — Added exact divisibility and bounded-product fast paths while
 retaining divide-before-multiply fallback behavior for large intermediates.
- **`0.1.4`** — Reused the validated GCD core without repeating input validation and added fast paths for equal and unit inputs.
- **`0.1.3`** — Added `lcm`.

## Signature

```ts
lcm(a: number, b: number): number
```

## Parameters

- `a` — A safe integer.
- `b` — A safe integer.

## Returns

Returns the smallest non-negative integer that is divisible by both inputs. `lcm(0, n)` and `lcm(0, 0)` return `0`.

## Errors

Throws `RangeError` when either argument is not a safe integer or when the exact result exceeds `Number.MAX_SAFE_INTEGER`.

```ts
import { lcm } from "numwise";

lcm(12, 18); // 36
lcm(-4, 6); // 12
lcm(0, 24); // 0
```

## Algorithm and performance

The implementation reuses the validated GCD core from `gcd.ts` without repeating validation. Equal, unit, and divisible inputs return immediately without running the Euclidean algorithm. In the general case, it divides one operand by the exact GCD before multiplying, then checks the reduced product against `Number.MAX_SAFE_INTEGER`. The general case runs in $O(\log(\min(|a|, |b|)))$ time with $O(1)$ additional space.
