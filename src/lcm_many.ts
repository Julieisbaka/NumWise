import { gcdUnchecked } from "./gcd.js";

/** Largest integer that an exact LCM may return. */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Returns the least common multiple of a collection of safe integers.
 * The empty collection has the multiplicative identity `1`; any zero input
 * makes the result `0`.
 *
 * @param values The values to combine; an empty collection returns `1`.
 * @throws {RangeError} If an input is not a safe integer or the exact result
 * exceeds Number.MAX_SAFE_INTEGER.
 */
export function lcmMany(values: readonly number[]): number {
    for (const value of values) {
        if (!Number.isSafeInteger(value)) {
            throw new RangeError(`lcmMany requires safe integers, received ${value}`);
        }
    }

    /** Multiplicative identity and running exact LCM. */
    let result = 1;
    for (const value of values) {
        if (value === 0) {
            return 0;
        }

        /** Non-negative value used by the GCD and multiplication steps. */
        const absoluteValue = Math.abs(value);
        if (absoluteValue === 1 || result % absoluteValue === 0) {
            continue;
        }

        /** GCD used to reduce the next product before multiplication. */
        const divisor = gcdUnchecked(result, absoluteValue);
        /** Candidate LCM after reduction. */
        const next = (result / divisor) * absoluteValue;
        if (next > MAX_SAFE_INTEGER) {
            throw new RangeError("lcmMany result exceeds Number.MAX_SAFE_INTEGER");
        }
        result = next;
    }

    return result;
}
