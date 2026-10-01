# `gcd`

## Version history

- **`0.2.8`** — Routes values above the unsigned 32-bit range directly to
  validated Euclidean reduction, avoiding an inapplicable bitwise range guard;
  simplifies the checked core loop and removes a duplicated modulo for
  non-divisible operands.
- **`0.2.3`** — Added a guarded unsigned-32-bit dispatch that skips
    general safe-integer validation, plus exact divisibility and two-step
    Euclidean reductions; all GCD calculations remain arithmetic and larger or
    negative inputs retain the full safe-integer path.
- **`0.1.4`** — Added zero, equality, and operand-order fast paths and shared the validated core with `lcm`.
- **`0.1.1`** — Added `gcd`.

Returns the greatest common divisor of two safe integers.

## Signature

```ts
gcd(a: number, b: number): number
```

The result is always non-negative. `gcd(0, 0)` returns `0`.

## Examples

```ts
import { gcd } from "numwise";

gcd(48, 18); // 6
gcd(17, 13); // 1
gcd(-48, 18); // 6
gcd(0, 24); // 24
```

## Errors

Throws `RangeError` if either argument is not a safe integer, including fractional values, `NaN`, infinities, and values outside the safe-integer range.

## Performance

`gcd` uses the iterative Euclidean algorithm with modulo arithmetic and does not allocate during calculation. Unsigned 32-bit inputs use a guarded fast dispatch that avoids redundant general validation; the guard uses bitwise conversion only to prove the range and never to calculate the GCD. Values above the unsigned 32-bit range skip that inapplicable guard. Zero, equal, and divisible inputs return immediately, and two Euclidean reductions are processed per loop iteration. Its runtime is logarithmic in the size of the input values.
