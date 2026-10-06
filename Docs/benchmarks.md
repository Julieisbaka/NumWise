# Benchmarking Numwise

Numwise provides two benchmark commands:

- `npm run benchmark` runs the existing Numwise-only regression workload.
- `npm run benchmark:compare` compares Numwise with selected third-party packages.
- `npm run benchmark:readme` runs the comparison benchmark and updates the
  comparison snapshot in `README.md`.

The comparison command prints every metadata and result table twice: first as
an aligned terminal table, then as copy-ready Markdown under a `Markdown:`
label. The Markdown result tables bold the lowest median and maximum values,
including every implementation when timings tie.

The comparison benchmark is a measurement tool, not a claim that Numwise is
faster in every workload. Run it on the same machine, Node.js version, and
working tree when comparing results. Close other CPU-heavy applications and
repeat runs if a result is important.

## Compared packages

The comparison runner currently tests the versions recorded in
`package.json`:

- **numwise**: the package in this repository, using its public Number API.
- **number-theory**: a Number-oriented package. It provides comparable GCD,
  primality, modular-power, factorization, and sieve functions.
- **compute-gcd**: a focused GCD package using a binary GCD implementation.
- **big-integer**: an arbitrary-precision integer package. Its comparisons
  include conversion from the benchmark's Number inputs and conversion back to
  Number, so the result represents an end-to-end call rather than only its
  arithmetic kernel.
- **mathjs**: a broad mathematical package. Its comparisons include its
  normal numeric dispatch and are limited to functions it exposes directly:
  GCD, LCM, and primality.

The benchmark does not compare unsupported operations or invent adapters that
change mathematical meaning. For example, `number-theory`'s sieve accepts an
exclusive upper bound, so the adapter passes `limit + 1` to produce the same
inclusive result as `numwise.primesUpTo`. Its prime-factor result is compared
only on a small semiprime where both packages return the same factor list. The
`number-theory` implementation builds a sieve up to the input when its cached
primes are insufficient, so larger semiprimes can exceed its practical array
limits; this case is intentionally kept within its documented implementation
limits rather than turning the benchmark into an allocation-failure test.

An implementation name ending in `*` may silently return an inexact Number
instead of rejecting an unrepresentable result for that operation. It does
not mark an implementation merely for having a practical limit or being slow.
Every measured input is correctness-checked before timing.

## Fairness rules

Every timed implementation:

1. Receives the same numeric values and equivalent output contract.
2. Performs its own normal public API validation and dispatch.
3. Includes per-call conversion and output allocation when that is part of the
   adapter's operation. In particular, `big-integer` conversion is timed.
4. Is checked against the expected result before timing.
5. Has every result consumed by a lightweight checksum during warmups and
   timed samples, preventing the benchmark from ignoring returned values.
6. Runs the same number of warmups and samples.
7. Runs in a deterministic shuffled order per case to avoid always favoring the
   first or last implementation in a process.

Package initialization is outside the timed region for all competitors. This
measures repeated function use, not installation or one-time module loading.
The output records Node.js, operating-system, CPU, and package versions so that
results can be reproduced responsibly.

## Interpreting results

Lower elapsed time is better for a row, but rows should only be compared within
the same operation and input case. A package may be slower because it offers a
broader contract, arbitrary precision, stronger semantics, or more general
dispatch. Those are trade-offs, not benchmark defects.

The primality comparison intentionally uses a medium-sized prime. The
`number-theory.isPrime` API is documented as a direct-factorization method and
can require impractical memory on large prime inputs; using such an input would
turn the benchmark into an out-of-memory test rather than a useful comparison.
The separate Numwise regression benchmark still includes large safe-integer
primality cases.

The benchmark output is not a permanent performance claim. Hardware, Node/V8,
thermal state, background processes, package versions, and compiler changes
can all affect timings.
