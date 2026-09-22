# `primeFactors`

Returns the prime factorization of a positive safe integer.

## Version history

- **`0.2.5`** — Uses the exact `isPrime` trial-division boundary of `201,600`
 instead of the previous estimated `1,000,000` cutoff for direct primality
 testing.
- **`0.2.2`** — Runs trial division in exact `number` arithmetic, so `BigInt`
 is allocated only for cofactors that actually reach Pollard Rho.
- **`0.2.2`** — Replaces Floyd cycle detection with Brent's variant and batches
 difference products, so one greatest-common-divisor call covers many
 iterations.
- **`0.2.2`** — Tests large inputs for primality before allocating factorization
 state, returning large prime inputs without trial division or Pollard Rho setup.
- **`0.2.0`** — Added wheel trial division with deterministic Pollard Rho fallback.

## Signature

```ts
primeFactors(value: number): number[]
```

## Returns

Returns prime factors in ascending order, including repeated factors. The
factorization of `1` is the empty array.

## Errors

Throws `RangeError` unless `value` is a positive safe integer.

## Examples

```ts
import { primeFactors } from "numwise";

primeFactors(360); // [2, 2, 2, 3, 3, 5]
primeFactors(97); // [97]
```

## Algorithm and performance

Factors `2`, `3`, and `5` are removed directly, followed by a `30`-wheel trial
division pass for small factors. All of that arithmetic stays in exact
`number` operations, since dividing a safe integer by one of its divisors is
exact. Above `201,600`, the exact small-candidate boundary used by `isPrime`,
the cofactor is tested for primality before factorization setup. Remaining
composite cofactors are split with Brent's Pollard Rho, which
accumulates differences and takes one greatest-common-divisor per batch, and
each leaf is confirmed with the package's deterministic safe-integer primality
test. Results are sorted before returning.
