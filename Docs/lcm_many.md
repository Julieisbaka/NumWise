# `lcmMany`

Returns the least common multiple of a collection of safe integers.

## Version history

- **`0.2.5`** — Skips redundant GCD and multiplication work for unit values and
 values already dividing the running LCM.
- **`0.2.0`** — Added `lcmMany` with zero and overflow early exits.

## Signature

```ts
lcmMany(values: readonly number[]): number
```

## Returns

Returns a non-negative exact LCM. The empty collection returns `1`; any zero
input returns `0` after all inputs have been validated.

## Errors

Throws `RangeError` if an input is not a safe integer or the exact result
exceeds `Number.MAX_SAFE_INTEGER`.

## Examples

```ts
import { lcmMany } from "numwise";

lcmMany([4, 6, 10]); // 60
lcmMany([0, 12]); // 0
```

## Algorithm and performance

Each step divides by the running GCD before multiplying, preventing avoidable
intermediate growth. The operation uses constant auxiliary space and stops as
soon as a zero or unrepresentable result is detected.
