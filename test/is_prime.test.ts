import { isPrime } from "../src/is_prime.js";
import { expectPerformance } from "./helpers.js";

const expectPrime = (value: number, expected: boolean): void => {
    if (isPrime(value) !== expected) {
        throw new Error(`isPrime(${value}) returned the wrong result`);
    }
};

// False: an even composite and an odd composite with non-trivial factors.
expectPrime(100, false);
expectPrime(221, false);
expectPrime(104728, false);
expectPrime(104729, true);

// The divisor table through 443 is complete below 449 squared.
expectPrime(201600, false);
expectPrime(201601, false);

// False bounds: below the lower bound and above the safe-integer upper bound.
expectPrime(1, false);
expectPrime(Number.MAX_SAFE_INTEGER + 1, false);

// True: small and large safe-integer primes.
expectPrime(2, true);
expectPrime(9007199254740881, true);

// Strong pseudoprimes for common weak Miller-Rabin witness sets.
expectPrime(2047, false);
expectPrime(3215031751, false);
expectPrime(341550071728321, false);

// Strong pseudoprimes at each deterministic base-set boundary. Every value is
// composite but survives the bases used immediately below its own tier.
expectPrime(1373653, false);
expectPrime(25326001, false);
expectPrime(2152302898747, false);
expectPrime(3474749660383, false);

// Primes and composites straddling the tier boundaries.
expectPrime(2039, true);
expectPrime(1373639, true);
expectPrime(25325981, true);
expectPrime(3215031749, true);
expectPrime(94906249, true);
expectPrime(94906266, false);
expectPrime(341550071728319, false);

// Tiered base selection must agree with trial division across a dense range.
for (let candidate = 2; candidate <= 20000; candidate++) {
    let divisible = candidate < 2;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
        if (candidate % divisor === 0) {
            divisible = true;
            break;
        }
    }
    expectPrime(candidate, !divisible);
}

// Coprimes are not automatically prime.
expectPrime(35, false);
expectPrime(91, false);

const benchmarkElapsed = expectPerformance(
    () => isPrime(9007199254740881),
    1000,
    500,
    "isPrime"
);

console.log(`isPrime tests passed; benchmark: ${benchmarkElapsed.toFixed(2)}ms`);
