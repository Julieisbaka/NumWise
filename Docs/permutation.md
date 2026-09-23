# `permutation`

Computes the number of ordered arrangements of `k` items selected from `n` items exactly when the result fits the safe-integer range.

## Version history

- **`0.2.7`** — Returns `n` directly for one-selection requests, avoiding
	loop setup for this common constant-time case.
- **`0.1.3`** — Added `permutation`.

## Signature

```ts
permutation(n: number, k: number): number
```

## Parameters

- `n` — A non-negative safe integer.
- `k` — A non-negative safe integer no greater than `n`.

## Returns

Returns the falling product

$$
P(n,k) = n(n-1)\cdots(n-k+1)
$$

The result is `1` when `k` is `0`.

## Errors

Throws `RangeError` when:

- `n` or `k` is negative
- `k` is greater than `n`
- Either argument is fractional, `NaN`, infinite, or outside the safe-integer range
- The exact result cannot be represented as a safe integer

```ts
import { permutation } from "numwise";

permutation(5, 2); // 20
permutation(10, 3); // 720
permutation(5, 0); // 1
```

## Algorithm and performance

The implementation returns `n` directly when `k` is `1`; otherwise, it
accumulates the falling product directly, stopping with `RangeError` as soon as
the result exceeds `Number.MAX_SAFE_INTEGER`. It uses $O(k)$ time and $O(1)$
additional space without factorials or intermediate arrays.
