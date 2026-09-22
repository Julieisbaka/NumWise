/** Product threshold below which Number multiplication remains exact. */
const SAFE_INTEGER_MAX = Number.MAX_SAFE_INTEGER;
/** Largest modulus whose residue products stay exactly representable. */
export const MAX_NUMBER_MODULUS = 94906265;

/**
 * Computes (base ** exponent) modulo modulus exactly for safe integers.
 *
 * @param base The base, which may be negative.
 * @param exponent The non-negative exponent.
 * @param modulus The positive modulus.
 * @throws {RangeError} If base or exponent is not a safe integer, exponent is
 * negative, or modulus is not a positive safe integer.
 */
export function modPow(base: number, exponent: number, modulus: number): number {
    if (
        !Number.isSafeInteger(base) ||
        !Number.isSafeInteger(exponent) ||
        !Number.isSafeInteger(modulus) ||
        exponent < 0 ||
        modulus < 1
    ) {
        throw new RangeError(
            `modPow requires safe integers with exponent >= 0 and modulus >= 1, ` +
            `received ${base}, ${exponent}, and ${modulus}`
        );
    }

    return modPowUnchecked(base, exponent, modulus);
}

/**
 * Computes modular exponentiation for already validated safe integers.
 * Inputs may have any safe integer base, a non-negative exponent, and a
 * positive modulus.
 *
 * @param base A validated safe-integer base.
 * @param exponent A validated non-negative exponent.
 * @param modulus A validated positive modulus.
 */
export function modPowUnchecked(
    base: number,
    exponent: number,
    modulus: number
): number {
    if (modulus === 1) {
        return 0;
    }

    if (exponent === 0) {
        return 1;
    }

    /** Base reduced into the canonical non-negative residue range. */
    base %= modulus;
    if (base < 0) {
        base += modulus;
    }

    if (base === 0 || base === 1) {
        return base;
    }
    if (exponent === 1) {
        return base;
    }

    if (modulus > MAX_NUMBER_MODULUS) {
        return Number(modPowBigNumberExponent(BigInt(base), exponent, BigInt(modulus)));
    }

    /** Accumulated modular result; every product below stays exact. */
    let result = 1;

    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }

        exponent = Math.floor(exponent / 2);
        if (exponent === 0) {
            break;
        }

        base = (base * base) % modulus;
    }

    return result;
}

/**
 * Computes modular exponentiation with BigInt residues and an exact Number
 * exponent, avoiding BigInt tests and shifts for public safe-integer inputs.
 *
 * @param base A reduced non-negative BigInt base.
 * @param exponent A validated non-negative safe-integer exponent.
 * @param modulus A BigInt modulus greater than one.
 */
export function modPowBigNumberExponent(
    base: bigint,
    exponent: number,
    modulus: bigint
): bigint {
    let result = 1n;

    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }

        exponent = Math.floor(exponent / 2);
        if (exponent === 0) {
            break;
        }

        base = (base * base) % modulus;
    }

    return result;
}

/**
 * Computes modular exponentiation entirely in BigInt, avoiding a per-multiply
 * conversion when the modulus exceeds the exact Number product range.
 *
 * @param base A reduced non-negative base.
 * @param exponent A non-negative exponent.
 * @param modulus A modulus greater than one.
 */
export function modPowBig(base: bigint, exponent: bigint, modulus: bigint): bigint {
    /** Accumulated modular result. */
    let result = 1n;

    while (exponent > 0n) {
        if (exponent & 1n) {
            result = (result * base) % modulus;
        }

        exponent >>= 1n;
        if (exponent === 0n) {
            break;
        }

        base = (base * base) % modulus;
    }

    return result;
}

/**
 * Multiplies non-negative modular values exactly, using BigInt only when the
 * Number product would exceed the exact safe-integer range.
 *
 * @param a A non-negative modular value.
 * @param b A non-negative modular value.
 * @param modulus The positive modulus used for reduction.
 */
export function multiplyMod(a: number, b: number, modulus: number): number {
    /** Fast Number product; exact when it stays within the safe range. */
    const product = a * b;

    if (product <= SAFE_INTEGER_MAX) {
        return product % modulus;
    }

    return Number((BigInt(a) * BigInt(b)) % BigInt(modulus));
}
