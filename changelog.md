# Changelog

## [0.2.7] - In development

- Reused `gcdUnchecked` for `combination`'s overflow-safe factor cancellation,
  removing duplicate Euclidean loops and sharing the optimized GCD path.
- Started arbitrary-degree `integerNthRoot` Newton iteration from a floating
  root estimate, reducing correction work while retaining exact BigInt checks.
- Shared capped exponentiation by squaring between `integerNthRoot`'s Newton
  denominator and correction paths, reducing repeated BigInt multiplications.

## [0.2.6] - 2026-09-23

- Fixed changelog issue

## [0.2.5] - 2026-09-23

- Reverted changelog schema change from `0.2.4`.
- Extended `isPrime`'s exact trial-division path through `201,600`, the
 highest value covered by its bundled divisors through `443`, before using
 deterministic Miller–Rabin.
- Aligned `primeFactors`' direct-primality cutoff with `isPrime`'s exact
 `201,600` trial-division boundary instead of the estimated `1,000,000` value.
- Removed duplicate primality testing before Pollard Rho splitting in
 `primeFactors` when the unchanged cofactor was already proven composite.
- Reduced arbitrary-degree `integerNthRoot` BigInt helper overhead by using
 Number loop counters and multiply-then-cap comparisons.
- Added reduced-base fast paths to `modPow` for bases `0` and `1`, plus
 exponent `1`.
- Avoided rescanning validated prefixes in `gcdMany` after an early GCD-of-one
 exit.
- Skipped redundant GCD and multiplication work in `lcmMany` for units and
 divisibility cases.
- Reduced Miller–Rabin overhead in `isPrime` by caching `value - 1`, reusing
 BigInt witness constants, and removing unreachable witness-bound checks.
- Reused cached square and cube values during `integerNthRoot` cube-root
 correction, avoiding repeated cube multiplications while preserving exactness.
- Reused each base prime's square within `primesUpTo` sieve loops, avoiding
  duplicate multiplication in the marking hot paths.

## [0.2.4]

- Changed changelog schema, date is no longer included.

## [0.2.3] - 2026-09-19

- Added guarded unsigned-32-bit dispatch, exact divisibility, and
 two-step Euclidean reductions to `gcd`; bitwise conversion only proves the
 fast-path range, while all GCD calculation remains exact modulo arithmetic.
- Added an exact divisibility fast path to `lcm`, avoiding the Euclidean loop
 when operands are directly divisible.
- Let `lcm` multiply first only when the product is provably safe, avoiding an
 unnecessary reduction division while retaining exact overflow protection.
- Added a compact exact prime-divisor table for `isPrime` candidates through
 `200,000`, avoiding modular exponentiation for small values while retaining
 deterministic Miller-Rabin for larger candidates.
- Kept safe-integer exponents in Number arithmetic during large-modulus
 `modPow` and Miller-Rabin loops, avoiding BigInt parity tests and shifts while
 residues remain exact BigInts.

## [0.2.2] - 2026-09-18

This release focuses on the exactness-preserving hot paths of the number-theory
functions; every change below was kept only after it improved measured timings.

- Added a reproducible `benchmark:compare` command comparing Numwise with
 Number-oriented, arbitrary-precision, and general-purpose packages using
 shared inputs, correctness checks, checksums, randomized case order, and
 recorded environment/package metadata.

- Selected the smallest deterministic Miller-Rabin base set per candidate in
 `isPrime`, cutting modular exponentiations for values below
 `341,550,071,728,321`.
- Ran `isPrime` and `modPow` entirely in `BigInt` above the exact Number
 product bound, converting operands once per call instead of once per modular
 multiplication, and kept smaller moduli on pure Number arithmetic.
- Computed cube roots in `integerNthRoot` without `BigInt` and reduced
 composite degrees through nested exact square and cube roots.
- Moved `primeFactors` trial division to exact Number arithmetic and replaced
 Floyd cycle detection with Brent's Pollard Rho using batched
 greatest-common-divisor calls.
- Added a zero-exponent fast path to modular exponentiation while retaining
 exact BigInt fallback multiplication.
- Added direct square-root and cube-root paths for `integerNthRoot`, avoiding
 repeated arbitrary-precision Newton iterations for common degrees.
- Let `primeFactors` return large prime inputs directly after deterministic
 primality testing, and skip unnecessary factorization setup.
- Let `combination` use its exact recurrence without factor cancellation while
 intermediate products remain within the safe-integer range.
- Removed redundant small-prime divisibility checks from `isPrime` while
 retaining direct rejection for composites divisible by `2` or `3`.
- Bounded `integerNthRoot` large-degree handling by returning `1` directly for
 degrees at least `53`, avoiding work linear in the degree for safe integers.

### Performance gains

Measured with the repository benchmark suite after warmup on Node.js/V8. Lower
times are better.

| Benchmark | Before | After | Gain |
| --- | ---: | ---: | ---: |
| `integerNthRoot/cube` | 1.79 ms | 0.05 ms | ~36× faster |
| `isPrime/prime-heavy` | 44.55 ms | 19.51 ms | 2.3× faster |
| `isPrime/large` | 41.96 ms | 22.02 ms | 1.9× faster |
| `modPow/large` | 15.71 ms | 8.29 ms | 1.9× faster |
| `primeFactors/prime` | 22.71 ms | 9.88 ms | 2.3× faster |
| `primeFactors/semiprime` | 19.87 ms | 12.81 ms | 1.6× faster |
| `isPrime` suite check | 85.69 ms | 48.16 ms | 1.8× faster |

## [0.2.1] - 2026-09-18

- Optimized `primesUpTo` with odd-only segmented buffers and direct marking of
 odd multiples.
- Removed the per-segment initialization pass and used bounded bitwise index
 arithmetic in the sieve hot loops.
- Raised the `primesUpTo` limit to `1_000_000_000` while retaining bounded
 segmented sieve memory.

## [0.2.0] - 2026-09-18

- Added optimized `gcdMany` and `lcmMany` batch operations with early exits.
- Added `primesUpTo` with an odd-only base sieve and segmented marking.
- Added `primeFactors` with wheel trial division and Pollard Rho fallback.
- Added exact `integerNthRoot` Newton iteration and `isPerfectSquare`.

## [0.1.5] - 2026-09-18

- Exposed the exact modular exponentiation used by `isPrime` as `modPow`.
- Optimized `combination`'s exact overflow fallback to continue from its already-computed prefix.

## [0.1.4] - 2026-09-18

- Optimized `lcm` with direct reuse of `gcd` and fast paths for equal and unit inputs.
- Removed duplicate GCD validation from `lcm` by sharing the internal validated GCD core.
- Added zero, equality, and operand-order fast paths to `gcd`.

## [0.1.3] - 2026-09-15

- Added `lcm` and `permutation` for exact safe-integer arithmetic.

## [0.1.2] - 2026-09-15

This patch hardens large-integer correctness and adds exact combinatorics:

- Corrected `isPrime` modular multiplication for large safe integers with an exact overflow fallback.
- Strengthened `isPrime` with a deterministic witness set covering the supported safe-integer range.
- Added `combination`, an exact multiplicative binomial-coefficient function that uses symmetry, factor cancellation, and an exact fallback for safe final results with unsafe intermediate products.

## [0.1.1] - 2026-09-15

- Added `integerSqrt`, an exact integer square-root function for non-negative safe integers.
- Added `gcd`, an iterative Euclidean greatest-common-divisor function for safe integers.
- Added invalid-input validation with `RangeError` for unsupported values.

## [0.1.0] - Initial release

- Added `isPrime` function for checking prime numbers
- Created Numwise
