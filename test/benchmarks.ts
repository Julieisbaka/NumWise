import { combination } from "../src/combination.js";
import { gcd } from "../src/gcd.js";
import { gcdMany } from "../src/gcd_many.js";
import { integerNthRoot } from "../src/integer_nth_root.js";
import { integerSqrt } from "../src/integer_sqrt.js";
import { isPerfectSquare } from "../src/is_perfect_square.js";
import { isPrime } from "../src/is_prime.js";
import { lcm } from "../src/lcm.js";
import { lcmMany } from "../src/lcm_many.js";
import { modPow } from "../src/mod_pow.js";
import { permutation } from "../src/permutation.js";
import { primeFactors } from "../src/prime_factors.js";
import { primesUpTo } from "../src/primes_up_to.js";

interface BenchmarkCase {
    readonly name: string;
    readonly iterations: number;
    readonly operation: () => number | boolean | number[];
    readonly validate: (result: number | boolean | number[]) => void;
}

const expectNumber = (expected: number) => (actual: number | boolean | number[]): void => {
    if (actual !== expected) {
        throw new Error(`expected ${expected}, received ${String(actual)}`);
    }
};

const expectBoolean = (expected: boolean) => (actual: number | boolean | number[]): void => {
    if (actual !== expected) {
        throw new Error(`expected ${expected}, received ${String(actual)}`);
    }
};

const expectArray = (expectedLength: number, expectedLast?: number) =>
    (actual: number | boolean | number[]): void => {
        if (!Array.isArray(actual) || actual.length !== expectedLength) {
            throw new Error(`expected an array of length ${expectedLength}`);
        }
        if (expectedLast !== undefined && actual[actual.length - 1] !== expectedLast) {
            throw new Error(`expected final element ${expectedLast}`);
        }
    };

const cases: readonly BenchmarkCase[] = [
    { name: "gcd/small", iterations: 10_000, operation: () => gcd(48, 18), validate: expectNumber(6) },
    { name: "gcd/large", iterations: 10_000, operation: () => gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693), validate: expectNumber(1) },
    { name: "gcd/prime-heavy", iterations: 10_000, operation: () => gcd(982_451_653, 961_748_941), validate: expectNumber(1) },
    { name: "gcd/composite-heavy", iterations: 10_000, operation: () => gcd(987_654_312, 493_827_156), validate: expectNumber(493_827_156) },
    { name: "gcdMany/small", iterations: 10_000, operation: () => gcdMany([48, 18, 30]), validate: expectNumber(6) },
    { name: "gcdMany/large-batch", iterations: 2_000, operation: () => gcdMany([Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693, 9_007_199_254_740_881]), validate: expectNumber(1) },
    { name: "lcm/small", iterations: 10_000, operation: () => lcm(21, 6), validate: expectNumber(42) },
    { name: "lcm/large", iterations: 10_000, operation: () => lcm(94_906_265, 94_906_264), validate: expectNumber(9_007_199_041_343_960) },
    { name: "lcmMany/small", iterations: 10_000, operation: () => lcmMany([3, 4, 5]), validate: expectNumber(60) },
    { name: "lcmMany/large-batch", iterations: 2_000, operation: () => lcmMany([2, 3, 5, 7, 11, 13]), validate: expectNumber(30_030) },
    { name: "modPow/small", iterations: 10_000, operation: () => modPow(2, 10, 1_000), validate: expectNumber(24) },
    { name: "modPow/large", iterations: 2_000, operation: () => modPow(Number.MAX_SAFE_INTEGER - 2, 4_294_967_291, 9_000_000_000_000_001), validate: expectNumber(8_714_278_007_221_593) },
    { name: "modPow/prime-heavy", iterations: 2_000, operation: () => modPow(982_451_653, 1_000_003, 1_000_000_007), validate: expectNumber(836_702_803) },
    { name: "modPow/composite-heavy", iterations: 2_000, operation: () => modPow(987_654_321, 987_654_321, 1_000_000_000), validate: expectNumber(417_420_721) },
    { name: "isPrime/small", iterations: 10_000, operation: () => isPrime(97), validate: expectBoolean(true) },
    { name: "isPrime/large", iterations: 500, operation: () => isPrime(9_007_199_254_740_881), validate: expectBoolean(true) },
    { name: "isPrime/prime-heavy", iterations: 2_000, operation: () => isPrime(982_451_653), validate: expectBoolean(true) },
    { name: "isPrime/composite-heavy", iterations: 10_000, operation: () => isPrime(987_654_321), validate: expectBoolean(false) },
    { name: "combination/small", iterations: 10_000, operation: () => combination(20, 10), validate: expectNumber(184_756) },
    { name: "combination/large", iterations: 1_000, operation: () => combination(52, 26), validate: expectNumber(495_918_532_948_104) },
    { name: "permutation/small", iterations: 10_000, operation: () => permutation(10, 5), validate: expectNumber(30_240) },
    { name: "permutation/large", iterations: 1_000, operation: () => permutation(18, 6), validate: expectNumber(13_366_080) },
    { name: "integerSqrt/large", iterations: 10_000, operation: () => integerSqrt(Number.MAX_SAFE_INTEGER), validate: expectNumber(94_906_265) },
    { name: "integerNthRoot/cube", iterations: 10_000, operation: () => integerNthRoot(Number.MAX_SAFE_INTEGER, 3), validate: expectNumber(208_063) },
    { name: "integerNthRoot/large-degree", iterations: 10, operation: () => integerNthRoot(Number.MAX_SAFE_INTEGER, 1_000), validate: expectNumber(1) },
    { name: "isPerfectSquare/perfect", iterations: 10_000, operation: () => isPerfectSquare(9_007_199_136_250_225), validate: expectBoolean(true) },
    { name: "isPerfectSquare/non-perfect", iterations: 10_000, operation: () => isPerfectSquare(Number.MAX_SAFE_INTEGER), validate: expectBoolean(false) },
    { name: "primeFactors/prime", iterations: 1_000, operation: () => primeFactors(982_451_653), validate: expectArray(1, 982_451_653) },
    { name: "primeFactors/near-primality-bound", iterations: 2_000, operation: () => primeFactors(300_007), validate: expectArray(1, 300_007) },
    { name: "primeFactors/semiprime", iterations: 100, operation: () => primeFactors(1_000_003 * 1_000_033), validate: expectArray(2, 1_000_033) },
    { name: "primesUpTo/small", iterations: 100, operation: () => primesUpTo(100), validate: expectArray(25, 97) },
    { name: "primesUpTo/segment-boundary", iterations: 3, operation: () => primesUpTo(2_097_153), validate: expectArray(155_611, 2_097_143) }
];

const warmups = 2;
const samples = 5;

const checksum = (result: number | boolean | number[]): number => {
    if (typeof result === "number") {
        return result;
    }
    if (typeof result === "boolean") {
        return result ? 1 : 0;
    }
    return result.length === 0 ? 0 : result.length + result[0] + result[result.length - 1];
};

for (const benchmarkCase of cases) {
    let checkedResult: number | boolean | number[] = benchmarkCase.operation();
    benchmarkCase.validate(checkedResult);

    for (let warmup = 0; warmup < warmups; warmup++) {
        for (let iteration = 0; iteration < benchmarkCase.iterations; iteration++) {
            checkedResult = benchmarkCase.operation();
        }
    }

    const timings: number[] = [];
    for (let sample = 0; sample < samples; sample++) {
        const start = performance.now();
        for (let iteration = 0; iteration < benchmarkCase.iterations; iteration++) {
            checkedResult = benchmarkCase.operation();
        }
        benchmarkCase.validate(checkedResult);
        timings.push(performance.now() - start);
    }

    timings.sort((left, right) => left - right);
    const median = timings[Math.floor(timings.length / 2)];
    const max = timings[timings.length - 1];
    const outputSize = Array.isArray(checkedResult) ? ` output=${checkedResult.length}` : "";
    console.log(`${benchmarkCase.name}: median=${median.toFixed(2)}ms max=${max.toFixed(2)}ms ` +
        `iterations=${benchmarkCase.iterations} checksum=${checksum(checkedResult)}${outputSize}`);
}
