import { integerSqrt } from "./integer_sqrt.js";

/** Largest cube root of a safe integer; its cube stays exactly representable. */
const MAX_CUBE_ROOT = 208063;

/**
 * Returns the exact integer floor of the n-th root of a non-negative safe
 * integer using integer Newton iteration.
 *
 * @param value The non-negative safe integer whose root is requested.
 * @param n The positive root degree.
 * @throws {RangeError} If value is negative or unsafe, or n is not a positive
 * safe integer.
 */
export function integerNthRoot(value: number, n: number): number {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new RangeError(`integerNthRoot requires a non-negative safe integer, received ${value}`);
    }
    if (!Number.isSafeInteger(n) || n < 1) {
        throw new RangeError(`integerNthRoot requires a positive safe integer degree, received ${n}`);
    }

    if (value < 2 || n === 1) {
        return value;
    }

    /** Every supported value is below 2^53, so degree 53 or more has root 1. */
    if (n >= 53) {
        return 1;
    }

    if (n === 2) {
        return integerSqrt(value);
    }

    if (n === 3) {
        return cubeRoot(value);
    }

    // Nested exact floor roots compose, so composite degrees reduce to the
    // cheap square and cube paths instead of arbitrary-precision iteration.
    if (n % 2 === 0) {
        return integerNthRoot(integerSqrt(value), n / 2);
    }

    if (n % 3 === 0) {
        return integerNthRoot(cubeRoot(value), n / 3);
    }

    /** BigInt target used for exact Newton and correction arithmetic. */
    const target = BigInt(value);
    /** BigInt degree used to keep the iteration exact. */
    const degree = BigInt(n);
    /** Initial power-of-two root estimate. */
    const initialBits = Math.max(1, Math.ceil(Math.log2(value) / n));
    /** Current Newton iterate. */
    let root = 1n << BigInt(initialBits);

    for (;;) {
        /** Bounded root^(degree - 1), used as Newton's denominator. */
        const denominator = boundedPower(root, n - 1, target);
        /** Next exact Newton iterate. */
        const next = ((degree - 1n) * root + target / denominator) / degree;
        if (next >= root) {
            break;
        }
        root = next;
    }

    while (comparePower(root, n, target) > 0) {
        root--;
    }
    while (comparePower(root + 1n, n, target) <= 0) {
        root++;
    }

    return Number(root);
}

/**
 * Returns the exact integer floor of a cube root without BigInt arithmetic.
 *
 * @param value A safe integer of at least two.
 */
function cubeRoot(value: number): number {
    /** Estimate clamped so every correction multiplication stays exact. */
    let root = Math.floor(Math.cbrt(value));
    if (root > MAX_CUBE_ROOT) {
        root = MAX_CUBE_ROOT;
    }

    /** Cached powers updated with exact neighboring-power identities. */
    let square = root * root;
    let cube = square * root;

    while (root > 0 && cube > value) {
        cube -= 3 * square - 3 * root + 1;
        square -= 2 * root - 1;
        root--;
    }

    while (root < MAX_CUBE_ROOT) {
        const nextCube = cube + 3 * square + 3 * root + 1;
        if (nextCube > value) {
            break;
        }

        square += 2 * root + 1;
        cube = nextCube;
        root++;
    }

    return root;
}

function boundedPower(base: bigint, exponent: number, limit: bigint): bigint {
    /** Accumulated power, capped once it exceeds the supplied limit. */
    let result = 1n;
    for (let index = 0; index < exponent; index++) {
        result *= base;
        if (result > limit) {
            return limit + 1n;
        }
    }
    return result;
}

function comparePower(base: bigint, exponent: number, target: bigint): number {
    /** Accumulated power used to compare against the target exactly. */
    if (exponent === 0) {
        return target === 1n ? 0 : 1;
    }

    let result = 1n;
    for (let index = 0; index < exponent; index++) {
        result *= base;
        if (result > target) {
            return 1;
        }
    }

    return result < target ? -1 : result > target ? 1 : 0;
}

