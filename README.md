# Numwise

Numwise is a mathematical library for exact safe integer calculations.

## Benchmarks

Run `npm run benchmark` for Numwise's regression workload, or
`npm run benchmark:compare` for a fair comparison with documented third-party
packages. See [docs/benchmarks.md](docs/benchmarks.md) for the compared APIs,
fairness rules, and interpretation guidance.

### Comparison snapshot

<!-- comparison-benchmark:start -->
The following results were measured on October 6, 2026. Times are elapsed
milliseconds for the listed iteration count; lower is better within the same
table. `Max` is the slowest of seven samples. Package initialization is
outside the timed region. Results vary with hardware, Node.js/V8, thermal
conditions, and background activity, so run `npm run benchmark:compare`
locally before making performance decisions.

| Environment | Value |
| --- | --- |
| Node | v24.15.0 |
| Platform | win32 x64 10.0.26200 |
| CPU | 12th Gen Intel(R) Core(TM) i5-12500H |
| OS | Windows 11 Home |

| Package | Version |
| --- | ---: |
| numwise | 0.2.9-dev |
| number-theory | 1.1.0 |
| compute-gcd | 1.2.1 |
| big-integer | 1.6.52 |
| mathjs | 15.2.0 |

#### `gcd/large` — 20000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise gcd | **2.32 ms** | 3.12 ms | 200001 |
| number-theory gcd | 2.35 ms | **2.66 ms** | 200001 |
| compute-gcd | 27.60 ms | 33.11 ms | 200001 |
| mathjs gcd | 942.10 ms | 1062.85 ms | 200001 |
| big-integer gcd | 50.94 ms | 60.19 ms | 200001 |

#### `lcm/safe-integer` — 20000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| big-integer lcm* | 20.12 ms | 24.61 ms | 1.8014488154699787e+21 |
| numwise lcm | **0.26 ms** | **0.37 ms** | 1.8014488154699787e+21 |
| mathjs lcm* | 0.49 ms | 0.68 ms | 1.8014488154699787e+21 |

#### `isPrime/medium` — 2000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| number-theory isPrime | 3011.28 ms | 3166.44 ms | 20001 |
| numwise isPrime | **0.49 ms** | **0.53 ms** | 20001 |
| mathjs isPrime | 0.53 ms | 0.55 ms | 20001 |
| big-integer isPrime | 27.03 ms | 35.39 ms | 20001 |

#### `modPow/large` — 2000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| number-theory powerMod* | 5.44 ms | 6.59 ms | 16734892762803 |
| big-integer modPow | 2.53 ms | 3.27 ms | 16734892762803 |
| numwise modPow | **1.41 ms** | **1.89 ms** | 16734892762803 |

#### `primeFactors/semiprime` — 100 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| number-theory primeFactors | 3212.84 ms | 6825.26 ms | 2010008 |
| numwise primeFactors | **0.54 ms** | **0.64 ms** | 2010008 |

#### `primesUpTo/medium` — 20 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise primesUpTo | **10.47 ms** | **10.80 ms** | 22026585 |
| number-theory sieve | 74.15 ms | 97.47 ms | 22026585 |

#### `gcd/small` — 30000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise gcd | **2.26 ms** | **2.59 ms** | 1800006 |
| compute-gcd | 5.10 ms | 5.66 ms | 1800006 |
| mathjs gcd | 998.28 ms | 1086.74 ms | 1800006 |
| number-theory gcd | 4.42 ms | 5.45 ms | 1800006 |
| big-integer gcd | 35.35 ms | 37.57 ms | 1800006 |

An asterisk marks an adapter that may return an inexact Number instead of
rejecting an unrepresentable result. `big-integer` rows include conversion
from Number inputs and conversion back; `mathjs` rows include its normal
numeric dispatch. See the benchmark guide for the complete fairness and
API-compatibility notes.
<!-- comparison-benchmark:end -->

## What Numwise is NOT

Numwise is **not** a replacement for packages that provide advanced mathematical functions or symbolic computation. It focuses on high-performance numerical calculations.
