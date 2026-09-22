# `isPrime`

## Version history

- **`0.2.5`** — Removes unreachable witness-bound checks, caches the Number
 `value - 1` residue, and reuses cached BigInt witness constants in the
 Miller–Rabin hot paths.
- **`0.2.5`** — Extends the exact trial-division path through `201,600`, the
 largest value fully covered by the bundled prime divisors through `443`,
 before switching to deterministic Miller–Rabin.
- **`0.2.3`** — Uses exact small-prime trial division for candidates through
 `200,000`, avoiding modular exponentiation for small values while retaining
 deterministic Miller-Rabin for larger candidates.
- **`0.2.2`** — Selects the smallest deterministic base set for each candidate,
 so values below `341,550,071,728,321` need as few as one modular
 exponentiation instead of seven.
- **`0.2.2`** — Runs Miller-Rabin entirely in `BigInt` once the candidate
 exceeds the exact Number product bound, converting operands once per test
 rather than once per modular multiplication.
- **`0.2.2`** — Handles composites divisible by `2` or `3` with direct checks
 and avoids retesting those divisors in the small-prime loop.
- **`0.1.5`** — Reused the shared modular exponentiation and modular multiplication cores.
- **`0.1.2`** — Replaced the previous Miller–Rabin witness set with the deterministic
  seven-witness set for the full supported safe-integer range.
- **`0.1.2`** — Corrected modular multiplication when `number` products exceed exact
  integer precision by using an exact `BigInt` fallback only on that path.
- **`0.1.0`** — Added `isPrime`.

Determines whether a value is a prime number.

## Signature

```ts
isPrime(value: number): boolean
```

## Parameters

- `value` — A safe JavaScript integer in the range `2` through `Number.MAX_SAFE_INTEGER`.

## Returns

Returns `true` when `value` is prime; otherwise returns `false`.

The function returns `false` for:

- Values below `2`
- Negative values
- Non-integers
- `NaN` and infinities
- Numbers larger than `Number.MAX_SAFE_INTEGER`
- Composite numbers

## Algorithm and accuracy

`isPrime` uses a small-candidate prime-table trial-division path through
`201,600` and deterministic Miller–Rabin for larger values. Candidates below
`341,550,071,728,321` use the smallest proven base set for their range, drawn
from the prefixes of `[2, 3, 5, 7, 11, 13, 17]`. Larger candidates use the
proven seven-witness set `[2, 325, 9375, 28178, 450775, 9780504, 1795265022]`.
Every tier is deterministic for its range, so composite values are never
reported as prime pseudoprimes.

Candidates at or below `94,906,265` keep all modular arithmetic in `number`,
where squaring a residue stays exact. Larger candidates run the whole test in
`BigInt`, which converts each operand once instead of once per multiplication.

The `0.1.2` update corrected large-value modular arithmetic and strengthened
the witness set to handle known strong pseudoprimes at the previous boundary.

## Examples

```ts
import { isPrime } from "numwise";

isPrime(2); // true
isPrime(97); // true
isPrime(100); // false
isPrime(1); // false
isPrime(3.14); // false
```

## Notes

JavaScript `number` values cannot represent every integer above `Number.MAX_SAFE_INTEGER`. Values outside the documented safe-integer range are rejected rather than approximated.
