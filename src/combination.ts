import { gcdUnchecked } from "./gcd.js";

/** Largest exact result representable by the public Number API. */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Returns the binomial coefficient n choose k exactly for safe-integer
 * results.
 *
 * @param n The size of the source set.
 * @param k The number of selected items.
 * @throws {RangeError} If n or k is invalid, k is greater than n, or the
 * result cannot be represented as a safe integer.
 */
export function combination(n: number, k: number): number {
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || n < 0 || k < 0 || k > n) {
        throw new RangeError(
            `combination requires safe integers with 0 <= k <= n, received ${n} and ${k}`
        );
    }

    /** Symmetric smaller selection count minimizes multiplicative factors. */
    k = Math.min(k, n - k);
    /** Running exact binomial coefficient. */
    let result = 1;

    for (let factor = 1; factor <= k; factor++) {
        /** Numerator and denominator for this recurrence step. */
        let numerator = n - k + factor;
        let denominator = factor;

        /** Uncancelled product used by the fast exact path. */
        const product = result * numerator;
        if (product <= MAX_SAFE_INTEGER) {
            /** The recurrence is exact while this intermediate stays safe. */
            result = product / denominator;
            continue;
        }

        /** Cancel factors before multiplication to avoid needless overflow. */
        let divisor = gcdUnchecked(numerator, denominator);
        numerator /= divisor;
        denominator /= divisor;

        divisor = gcdUnchecked(result, denominator);
        result /= divisor;
        denominator /= divisor;

        const reducedProduct = result * numerator;

        if (reducedProduct > MAX_SAFE_INTEGER) {
            /** Continue from the exact prefix instead of restarting. */
            let exactResult =
                (BigInt(result) * BigInt(numerator)) / BigInt(denominator);
            for (let exactFactor = factor + 1; exactFactor <= k; exactFactor++) {
                exactResult =
                    (exactResult * BigInt(n - k + exactFactor)) /
                    BigInt(exactFactor);
            }

            if (exactResult > BigInt(MAX_SAFE_INTEGER)) {
                throw new RangeError("combination result exceeds Number.MAX_SAFE_INTEGER");
            }

            return Number(exactResult);
        }

        result = reducedProduct / denominator;
    }

    return result;
}
