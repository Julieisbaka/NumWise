# `gcdMany`

Returns the greatest common divisor of a collection of safe integers.

## Version history

- **`0.2.5`** — Validates only the unvisited suffix after an early GCD-of-one
 exit instead of rescanning the already validated prefix.
- **`0.2.0`** — Added `gcdMany` with validation-preserving early exits.

## Signature

```ts
gcdMany(values: readonly number[]): number
```

## Returns

Returns a non-negative GCD. The empty collection returns `0`; once the running
GCD reaches `1`, arithmetic work stops while remaining inputs are still
validated.

## Errors

Throws `RangeError` if any value is not a safe integer.

## Examples

```ts
import { gcdMany } from "numwise";

gcdMany([84, 126, 210]); // 42
gcdMany([15, 28, 121]); // 1
```

## Algorithm and performance

The function applies the iterative Euclidean algorithm from left to right in
constant auxiliary space. It avoids further GCD calculations after reaching
`1`.
