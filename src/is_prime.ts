import { MAX_NUMBER_MODULUS, modPowBigNumberExponent, modPowUnchecked } from "./mod_pow.js";

/** Small divisors worth testing before entering Miller-Rabin. */
const SMALL_PRIMES = [5, 7, 11, 13, 17] as const;
/** Trial division is cheaper than modular exponentiation for small values. */
const TRIAL_DIVISION_LIMIT = 201_600;
/** Prime divisors needed to trial-divide every value through the limit. */
const SMALL_TRIAL_PRIMES = [
    19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83,
    89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157,
    163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
    239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313,
    317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401,
    409, 419, 421, 431, 433, 439, 443
] as const;
/** Deterministic Miller-Rabin witnesses for every safe integer. */
const WITNESSES = [2, 325, 9375, 28178, 450775, 9780504, 1795265022] as const;
const BIG_WITNESSES = WITNESSES.map(BigInt);
/**
 * Deterministic bases for candidates below 341,550,071,728,321. Each tier is a
 * prefix of this array, so a count selects the smallest exact base set and
 * every witness lookup uses one array shape.
 */
const PREFIX_BASES = [2, 3, 5, 7, 11, 13, 17] as const;
const BIG_PREFIX_BASES = PREFIX_BASES.map(BigInt);

/**
 * Tests whether a safe integer is prime using deterministic Miller-Rabin.
 * The fixed witness set makes this exact for Number safe integers; it is not
 * a probabilistic test in this supported range.
 *
 * @param value The candidate safe integer.
 */
export function isPrime(value: number): boolean {
    if (!Number.isSafeInteger(value) || value < 2) {
        return false;
    }

    if (value === 2 || value === 3) {
        return true;
    }

    if (value % 2 === 0) {
        return false;
    }

    if (value % 3 === 0) {
        return false;
    }

    for (const witness of SMALL_PRIMES) {
        if (value % witness === 0) {
            return value === witness;
        }
    }

    if (value <= TRIAL_DIVISION_LIMIT) {
        return isPrimeBySmallPrimes(value);
    }

    /** Decompose value - 1 as exponent * 2 ** powersOfTwo. */
    let exponent = value - 1;
    let powersOfTwo = 0;

    while (exponent % 2 === 0) {
        exponent /= 2;
        powersOfTwo++;
    }

    const baseCount = prefixBaseCountFor(value);
    const bases = baseCount === 0 ? WITNESSES : PREFIX_BASES;
    const bigBases = baseCount === 0 ? BIG_WITNESSES : BIG_PREFIX_BASES;
    const count = baseCount === 0 ? WITNESSES.length : baseCount;

    return value > MAX_NUMBER_MODULUS
        ? millerRabinBig(value, exponent, powersOfTwo, bigBases, count)
        : millerRabinNumber(value, exponent, powersOfTwo, bases, count);
}

/**
 * Tests small candidates using a compact table of prime divisors.
 *
 * Divisors through 17 are checked by the caller, so this starts at 19.
 */
function isPrimeBySmallPrimes(value: number): boolean {
    for (const divisor of SMALL_TRIAL_PRIMES) {
        if (divisor * divisor > value) {
            return true;
        }
        if (value % divisor === 0) {
            return false;
        }
    }

    return true;
}

/**
 * Returns how many leading `PREFIX_BASES` entries are deterministic for a
 * candidate, or zero when the general witness set is required.
 *
 * @param value The candidate safe integer.
 */
function prefixBaseCountFor(value: number): number {
    if (value < 2_047) {
        return 1;
    }
    if (value < 1_373_653) {
        return 2;
    }
    if (value < 25_326_001) {
        return 3;
    }
    if (value < 3_215_031_751) {
        return 4;
    }
    if (value < 2_152_302_898_747) {
        return 5;
    }
    if (value < 3_474_749_660_383) {
        return 6;
    }
    if (value < 341_550_071_728_321) {
        return 7;
    }

    return 0;
}

/**
 * Runs Miller-Rabin with exact Number arithmetic for small candidates.
 *
 * @param value The candidate, no greater than the exact product bound.
 * @param exponent The odd part of value - 1.
 * @param powersOfTwo The power of two removed from value - 1.
 * @param bases The deterministic base array for this candidate.
 * @param count How many leading bases to apply.
 */
function millerRabinNumber(
    value: number,
    exponent: number,
    powersOfTwo: number,
    bases: readonly number[],
    count: number
): boolean {
    /** Residue that proves a witness inconclusive. */
    const minusOne = value - 1;

    for (let index = 0; index < count; index++) {
        const witness = bases[index];

        /** Modular witness result for the current Miller-Rabin round. */
        let result = modPowUnchecked(witness, exponent, value);
        if (result === 1 || result === minusOne) {
            continue;
        }

        /** Witness remains inconclusive if squaring reaches value - 1. */
        let probablyPrime = false;
        for (let round = 1; round < powersOfTwo; round++) {
            result = (result * result) % value;
            if (result === minusOne) {
                probablyPrime = true;
                break;
            }
        }

        if (!probablyPrime) {
            return false;
        }
    }

    return true;
}

/**
 * Runs Miller-Rabin in BigInt for candidates whose squares overflow Number,
 * converting each operand once instead of once per modular multiplication.
 *
 * @param value The candidate above the exact product bound.
 * @param exponent The odd part of value - 1.
 * @param powersOfTwo The power of two removed from value - 1.
 * @param bases The deterministic base array for this candidate.
 * @param count How many leading bases to apply.
 */
function millerRabinBig(
    value: number,
    exponent: number,
    powersOfTwo: number,
    bases: readonly bigint[],
    count: number
): boolean {
    const modulus = BigInt(value);
    /** Residue that proves a witness inconclusive. */
    const minusOne = modulus - 1n;

    for (let index = 0; index < count; index++) {
        const witness = bases[index];

        /** Modular witness result for the current Miller-Rabin round. */
        let result = modPowBigNumberExponent(witness, exponent, modulus);
        if (result === 1n || result === minusOne) {
            continue;
        }

        /** Witness remains inconclusive if squaring reaches value - 1. */
        let probablyPrime = false;
        for (let round = 1; round < powersOfTwo; round++) {
            result = (result * result) % modulus;
            if (result === minusOne) {
                probablyPrime = true;
                break;
            }
        }

        if (!probablyPrime) {
            return false;
        }
    }

    return true;
}
