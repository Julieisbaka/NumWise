# Numwise

Numwise is a mathematical library for exact safe integer calculations.

## Benchmarks

Run `npm run benchmark` for Numwise's regression workload, or
`npm run benchmark:compare` for a fair comparison with documented third-party
packages. See [docs/benchmarks.md](docs/benchmarks.md) for the compared APIs,
fairness rules, and interpretation guidance.

### Comparison snapshot

The following results were measured on September 22, 2026. Times are elapsed
milliseconds for the listed iteration count; lower is better within the same
table. `Max` is the slowest of seven samples. Package initialization is outside the timed region. Results vary with hardware, Node.js/V8, thermal conditions, and background activity, so run `npm run benchmark:compare` locally before making performance decisions.

| Environment | Value |
| --- | --- |
| Node | v24.15.0 |
| Platform | win32 x64 10.0.26200 |
| CPU | 12th Gen Intel(R) Core(TM) i5-12500H |
| OS | Windows 11 Home |

| Package | Version |
| --- | ---: |
| numwise | 0.2.5-dev |
| number-theory | 1.1.0 |
| compute-gcd | 1.2.1 |
| big-integer | 1.6.52 |
| mathjs | 15.2.0 |

#### `gcd/large` — 20,000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise gcd | 1.86 ms | 2.87 ms | 200001 |
| number-theory gcd | **1.65 ms** | **1.95 ms** | 200001 |
| compute-gcd | 18.24 ms | 18.81 ms | 200001 |
| mathjs gcd | 1384.83 ms | 1407.91 ms | 200001 |
| big-integer gcd | 52.98 ms | 55.74 ms | 200001 |

#### `lcm/safe-integer` — 20,000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| big-integer lcm* | 22.54 ms | 23.90 ms | 1.8014488154699787e+21 |
| numwise lcm | **0.25 ms** | **0.34 ms** | 1.8014488154699787e+21 |
| mathjs lcm* | 0.66 ms | 0.88 ms | 1.8014488154699787e+21 |

#### `isPrime/medium` — 2,000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| number-theory isPrime | 3794.89 ms | 3903.23 ms | 20001 |
| numwise isPrime | **0.62 ms** | **0.81 ms** | 20001 |
| mathjs isPrime | **0.62 ms** | **0.66 ms** | 20001 |
| big-integer isPrime | 29.91 ms | 38.24 ms | 20001 |

#### `modPow/large` — 2,000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| number-theory powerMod* | 5.67 ms | 6.06 ms | 16734892762803 |
| big-integer modPow | 2.84 ms | 3.20 ms | 16734892762803 |
| numwise modPow | **1.40 ms** | **1.71 ms** | 16734892762803 |

#### `primeFactors/semiprime` — 100 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| number-theory primeFactors | 3022.69 ms | 3219.96 ms | 2010008 |
| numwise primeFactors | **0.30 ms** | **0.37 ms** | 2010008 |

#### `primesUpTo/medium` — 20 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise primesUpTo | **5.78 ms** | **5.93 ms** | 22026585 |
| number-theory sieve | 33.68 ms | 38.57 ms | 22026585 |

#### `gcd/small` — 30,000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise gcd | **1.37 ms** | **1.91 ms** | 1800006 |
| compute-gcd | 3.19 ms | 3.45 ms | 1800006 |
| mathjs gcd | 537.10 ms | 593.48 ms | 1800006 |
| number-theory gcd | 2.82 ms | 3.37 ms | 1800006 |
| big-integer gcd | 19.54 ms | 19.89 ms | 1800006 |

#### `combination/context` — 10,000 iterations

| Implementation | Median | Max | Checksum |
| --- | ---: | ---: | ---: |
| numwise combination | **0.61 ms** | **0.80 ms** | 18475784756 |

An asterisk marks an adapter that may return an inexact Number instead of
rejecting an unrepresentable result. `big-integer` rows include conversion
from Number inputs and conversion back; `mathjs` rows include its normal
numeric dispatch. See the benchmark guide for the complete fairness and
API-compatibility notes.

## What Numwise is NOT

Numwise is **not** a replacement for packages that provide advanced mathematical functions or symbolic computation. It focuses on high-performance numerical calculations.
