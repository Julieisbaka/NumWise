/** Largest exact result representable by the public Number API. */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Returns the number of ordered arrangements of k items selected from n items.
 *
 * @param n The number of available items.
 * @param k The number of ordered selections.
 * @throws {RangeError} If n or k is invalid, k is greater than n, or the exact
 * result cannot be represented as a safe integer.
 */
export function permutation(n: number, k: number): number {
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || n < 0 || k < 0 || k > n) {
        throw new RangeError(
            `permutation requires safe integers with 0 <= k <= n, received ${n} and ${k}`
        );
    }

    if (k === 1) {
        return n;
    }

    /** Running exact falling product. */
    let result = 1;

    for (let factor = 0; factor < k; factor++) {
        /** Next falling-product value before the safe-range check. */
        const product = result * (n - factor);

        if (product > MAX_SAFE_INTEGER) {
            throw new RangeError("permutation result exceeds Number.MAX_SAFE_INTEGER");
        }

        result = product;
    }

    return result;
}
