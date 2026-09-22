/** Largest supported sieve limit under the documented memory policy. */
const MAX_SIEVE_LIMIT = 1_000_000_000;
/** Number of odd candidates in each temporary segmented-sieve buffer. */
const SEGMENT_ODD_COUNT = 1 << 20;

/**
 * Returns all prime numbers less than or equal to a non-negative limit.
 *
 * @param limit The inclusive upper bound for prime generation.
 * @throws {RangeError} If the limit is negative, unsafe, non-integral, or too
 * large to produce a practical in-memory result.
 */
export function primesUpTo(limit: number): number[] {
    if (!Number.isSafeInteger(limit) || limit < 0 || limit > MAX_SIEVE_LIMIT) {
        throw new RangeError(
            `primesUpTo requires a safe integer from 0 through ${MAX_SIEVE_LIMIT}, received ${limit}`
        );
    }

    if (limit < 2) {
        return [];
    }

    /** Base primes used to mark composites in each temporary segment. */
    const basePrimes = oddSieve(Math.floor(Math.sqrt(limit)));
    /** Output array; unlike the segment, it grows with the number of primes. */
    const primes: number[] = [2];

    for (let segmentStart = 3; segmentStart <= limit; segmentStart += SEGMENT_ODD_COUNT * 2) {
        const segmentEnd = Math.min(limit, segmentStart + SEGMENT_ODD_COUNT * 2 - 2);
        /** Number of odd candidates represented by this segment. */
        const segmentLength = ((segmentEnd - segmentStart) >> 1) + 1;
        /** Composite flags for the current odd-only segment. */
        const segment = new Uint8Array(segmentLength);

        for (const prime of basePrimes) {
            const primeSquare = prime * prime;
            if (primeSquare > segmentEnd) {
                break;
            }

            /** First odd multiple of this prime inside the current segment. */
            let multiple = primeSquare;
            if (multiple < segmentStart) {
                const remainder = segmentStart % prime;
                multiple = remainder === 0 ? segmentStart : segmentStart + prime - remainder;
                if (multiple % 2 === 0) {
                    multiple += prime;
                }
            }

            for (; multiple <= segmentEnd; multiple += prime * 2) {
                segment[(multiple - segmentStart) >> 1] = 1;
            }
        }

        for (let index = 0, value = segmentStart; index < segmentLength; index++, value += 2) {
            if (segment[index] === 0) {
                primes.push(value);
            }
        }
    }

    return primes;
}

function oddSieve(limit: number): number[] {
    /** Odd-only composite flags; index i represents value 2i + 3. */
    if (limit < 3) {
        return [];
    }

    const composite = new Uint8Array((limit - 1) >> 1);
    const primes: number[] = [];

    for (let index = 0; index < composite.length; index++) {
        if (composite[index] !== 0) {
            continue;
        }

        const prime = (index << 1) + 3;
        const primeSquare = prime * prime;
        primes.push(prime);
        if (primeSquare <= limit) {
            for (let multiple = (primeSquare - 3) >> 1; multiple < composite.length; multiple += prime) {
                composite[multiple] = 1;
            }
        }
    }

    return primes;
}
