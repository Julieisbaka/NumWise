import { primeFactors } from "../src/prime_factors.js";
import { isPrime } from "../src/is_prime.js";
import { expectPerformance, expectRangeError } from "./helpers.js";

const expectString = (actual: string, expected: string, label: string): void => {
	if (actual !== expected) {
		throw new Error(`${label}: expected ${expected}, received ${actual}`);
	}
};

expectString(primeFactors(1).join(","), "", "one has no prime factors");
expectString(primeFactors(360).join(","), "2,2,2,3,3,5", "repeated factors");
expectString(primeFactors(97).join(","), "97", "prime input");
expectString(primeFactors(201601).join(","), "449,449", "trial/primality boundary");
expectString(primeFactors(300007).join(","), "300007", "direct-primality workload");
expectString(primeFactors(1_000_003 * 1_000_033).join(","), "1000003,1000033", "Pollard Rho semiprime");

// Every factorization must be prime, ascending, and multiply back exactly.
const expectFactorization = (value: number): void => {
    const factors = primeFactors(value);
    let product = 1;
    for (let index = 0; index < factors.length; index++) {
        if (!isPrime(factors[index])) {
            throw new Error(`primeFactors(${value}) returned composite factor ${factors[index]}`);
        }
        if (index > 0 && factors[index] < factors[index - 1]) {
            throw new Error(`primeFactors(${value}) returned unsorted factors`);
        }
        product *= factors[index];
    }
    if (product !== value) {
        throw new Error(`primeFactors(${value}) product ${product} does not match`);
    }
};

for (let value = 1; value <= 3000; value++) {
    expectFactorization(value);
}

for (const value of [
    2 ** 40,
    3 ** 30,
    1_000_000_007,
    999_999_937 * 7,
    104_729 * 104_723,
    2_147_483_647,
    4_294_967_291 * 2,
    9_007_199_254_740_881,
    9_007_199_254_740_990,
    6_469_693_230
]) {
    expectFactorization(value);
}
expectRangeError(primeFactors, 0);
expectRangeError(primeFactors, -1);
expectRangeError(primeFactors, 1.5);
expectRangeError(primeFactors, Number.NaN);
expectRangeError(primeFactors, Number.MAX_SAFE_INTEGER + 1);

expectPerformance(() => primeFactors(1_000_003 * 1_000_033), 100, 1000, "primeFactors");

console.log("primeFactors tests passed");
