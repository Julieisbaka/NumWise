import { isPrime } from "./is_prime.js";

/** Smallest factors removed before the wheel trial-division pass. */
const SMALL_FACTORS = [2, 3, 5] as const;
/** Candidate increments visiting integers coprime to 2, 3, and 5. */
const WHEEL = [4, 2, 4, 2, 4, 6, 2, 6] as const;
/** Trial division stops here; larger cofactors go to Pollard Rho. */
const TRIAL_DIVISION_LIMIT = 1_000;
/** Above isPrime's exact trial-division boundary, test primality directly. */
const DIRECT_PRIMALITY_BOUND = 201_600;
/** Differences accumulated per batched Pollard Rho GCD. */
const RHO_BATCH = 128n;

/**
 * Returns the prime factors of a positive safe integer in ascending order,
 * including repeated factors.
 *
 * @param value The positive safe integer to factor.
 * @throws {RangeError} If value is not a positive safe integer.
 */
export function primeFactors(value: number): number[] {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new RangeError(`primeFactors requires a positive safe integer, received ${value}`);
    }

    /** Large primes return directly after deterministic primality testing. */
    if (value > DIRECT_PRIMALITY_BOUND && isPrime(value)) {
        return [value];
    }

    /** Trial division stays exact in Number arithmetic for safe integers. */
    let remaining = value;
    const factors: number[] = [];

    for (const divisor of SMALL_FACTORS) {
        while (remaining % divisor === 0) {
            factors.push(divisor);
            remaining /= divisor;
        }
    }

    /** Current wheel candidate used for trial division. */
    let divisor = 7;
    /** Index of the next increment in the 30-wheel cycle. */
    let wheelIndex = 0;
    while (divisor <= TRIAL_DIVISION_LIMIT && divisor * divisor <= remaining) {
        while (remaining % divisor === 0) {
            factors.push(divisor);
            remaining /= divisor;
        }
        divisor += WHEEL[wheelIndex];
        wheelIndex = (wheelIndex + 1) % WHEEL.length;
    }

    if (remaining > 1) {
        factorRecursive(remaining, factors);
    }

    factors.sort((a, b) => a - b);
    return factors;
}

/**
 * Splits a cofactor into primes, appending them in arbitrary order.
 *
 * @param value A cofactor greater than zero with no small prime factors.
 * @param factors Collector for discovered prime factors.
 */
function factorRecursive(value: number, factors: number[]): void {
    /** Split composite cofactors until every leaf is prime. */
    if (value === 1) {
        return;
    }

    if (isPrime(value)) {
        factors.push(value);
        return;
    }

    /** Non-trivial divisor returned by Pollard Rho. */
    const divisor = Number(pollardRho(BigInt(value)));
    factorRecursive(divisor, factors);
    factorRecursive(value / divisor, factors);
}

/**
 * Finds a non-trivial divisor using Brent's cycle detection, batching the
 * difference products so one GCD covers many iterations.
 *
 * @param value An odd composite greater than the trial-division limit.
 */
function pollardRho(value: bigint): bigint {
    /** Retry with a new polynomial constant if a cycle returns the input. */
    for (let constant = 1n; ; constant++) {
        /** Hare state; `x` holds the cycle anchor and `ys` the batch start. */
        let y = 2n;
        let x: bigint;
        let ys = 2n;
        /** Current GCD candidate; `1` means no factor found yet. */
        let factor = 1n;
        /** Accumulated product of differences for the batched GCD. */
        let product = 1n;
        /** Length of the current Brent cycle segment. */
        let range = 1n;

        do {
            x = y;
            for (let step = 0n; step < range; step++) {
                y = (y * y + constant) % value;
            }

            for (let done = 0n; done < range && factor === 1n; done += RHO_BATCH) {
                ys = y;
                const batch = RHO_BATCH < range - done ? RHO_BATCH : range - done;
                for (let step = 0n; step < batch; step++) {
                    y = (y * y + constant) % value;
                    const difference = x > y ? x - y : y - x;
                    if (difference !== 0n) {
                        product = (product * difference) % value;
                    }
                }
                factor = bigintGcd(product, value);
            }

            range *= 2n;
        } while (factor === 1n);

        if (factor === value) {
            /** Re-walk the last batch one step at a time to isolate the factor. */
            do {
                ys = (ys * ys + constant) % value;
                factor = bigintGcd(x > ys ? x - ys : ys - x, value);
            } while (factor === 1n);
        }

        if (factor > 1n && factor < value) {
            return factor;
        }
    }
}

/**
 * Computes the greatest common divisor of two BigInt values.
 *
 * @param a A non-negative BigInt.
 * @param b A non-negative BigInt.
 */
function bigintGcd(a: bigint, b: bigint): bigint {
    /** Euclid's algorithm for exact BigInt differences and cofactors. */
    while (b !== 0n) {
        /** Remainder from the current Euclidean reduction step. */
        const remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}
