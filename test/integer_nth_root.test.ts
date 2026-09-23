import { integerNthRoot } from "../src/integer_nth_root.js";
import { expectEqual, expectPerformance, expectRangeError } from "./helpers.js";

expectEqual(integerNthRoot(0, 3), 0, "zero root");
expectEqual(integerNthRoot(1, 99), 1, "unit root");
expectEqual(integerNthRoot(64, 3), 4, "perfect cube");
expectEqual(integerNthRoot(65, 3), 4, "floored cube root");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, 2), 94_906_265, "large square root");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, 3), 208_063, "large cube root");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, 5), 1_552, "large fifth root");
expectEqual(integerNthRoot(8, 1), 8, "degree one");
expectEqual(integerNthRoot(81, 2), 9, "degree two");
expectEqual(integerNthRoot(1_000, 3), 10, "degree three");
expectEqual(integerNthRoot(1_000_000, 10), 3, "degree ten");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, 1_000), 1, "large degree");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), 1, "near-safe-integer degree");

for (const [value, degree] of [[2, 2], [15, 2], [80, 3], [999, 4]] as const) {
    const root = integerNthRoot(value, degree);
    if (!(root ** degree <= value && (root + 1) ** degree > value)) {
        throw new Error(`integerNthRoot(${value}, ${degree}) violated its invariant`);
    }
}

// Composite degrees reduce through the square and cube paths, so exact powers
// and their neighbours must still be floored correctly.
for (const degree of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 18, 24, 27, 32, 36, 52]) {
    for (let root = 1; root <= 40; root++) {
        const power = root ** degree;
        if (power > Number.MAX_SAFE_INTEGER) {
            break;
        }
        expectEqual(integerNthRoot(power, degree), root, `exact ${root}^${degree}`);
        expectEqual(integerNthRoot(power + 1, degree), root, `above ${root}^${degree}`);
        if (root > 1) {
            expectEqual(integerNthRoot(power - 1, degree), root - 1, `below ${root}^${degree}`);
        }
    }
}

// The cube path is Number-based and must stay exact at its upper bound.
expectEqual(integerNthRoot(208_063 ** 3, 3), 208_063, "largest exact cube");
expectEqual(integerNthRoot(208_063 ** 3 - 1, 3), 208_062, "below the largest exact cube");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, 4), 9_741, "fourth root");
expectEqual(integerNthRoot(Number.MAX_SAFE_INTEGER, 6), 456, "sixth root");

expectRangeError(integerNthRoot, -1, 2);
expectRangeError(integerNthRoot, 8, 0);
expectRangeError(integerNthRoot, 8, 1.5);
expectRangeError(integerNthRoot, Number.NaN, 2);
expectRangeError(integerNthRoot, 8, Number.POSITIVE_INFINITY);
expectRangeError(integerNthRoot, Number.MAX_SAFE_INTEGER + 1, 2);

expectPerformance(() => integerNthRoot(Number.MAX_SAFE_INTEGER, 3), 100_000, 1000, "integerNthRoot");
expectPerformance(() => integerNthRoot(Number.MAX_SAFE_INTEGER, 5), 10_000, 1000, "integerNthRoot arbitrary degree");

console.log("integerNthRoot tests passed");
