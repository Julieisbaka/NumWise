import { gcdUnchecked } from "./gcd.js";

/** Largest integer that all Number arithmetic must preserve exactly. */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Returns the least common multiple of two safe integers.
 *
 * The result is always non-negative. `lcm(0, 0)` and `lcm(0, n)` return `0`.
 *
 * @param a The first safe integer.
 * @param b The second safe integer.
 * @throws {RangeError} If either argument is not a safe integer or the result
 * exceeds Number.MAX_SAFE_INTEGER.
 */
export function lcm(a: number, b: number): number {
    if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) {
        throw new RangeError(
            `lcm requires safe integers, received ${a} and ${b}`
        );
    }

    if (a === 0 || b === 0) {
        return 0;
    }

    a = Math.abs(a);
    b = Math.abs(b);

    /** These common cases avoid the Euclidean algorithm entirely. */
    if (a === b || a === 1) {
        return b;
    }

    if (b === 1) {
        return a;
    }

    /** If the larger operand is divisible by the smaller, it is the LCM. */
    if (a < b) {
        const smaller = a;
        a = b;
        b = smaller;
    }
    if (a % b === 0) {
        return a;
    }

    /** GCD used to reduce one operand before multiplication. */
    const divisor = gcdUnchecked(a, b);
    /** Exact division removes the need for a pre-multiplication bound check. */
    const result = (a / divisor) * b;

    if (result > MAX_SAFE_INTEGER) {
        throw new RangeError("lcm result exceeds Number.MAX_SAFE_INTEGER");
    }

    return result;
}
