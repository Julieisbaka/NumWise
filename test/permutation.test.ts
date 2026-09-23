import { expectEqual, expectPerformance, expectRangeError } from "./helpers.js";
import { permutation } from "../src/permutation.js";

expectEqual(permutation(5, 0), 1, "zero selections");
expectEqual(permutation(5, 1), 5, "one selection");
expectEqual(permutation(Number.MAX_SAFE_INTEGER, 1), Number.MAX_SAFE_INTEGER, "largest one selection");
expectEqual(permutation(5, 2), 20, "small permutation");
expectEqual(permutation(10, 3), 720, "ordered selection");
expectEqual(permutation(30, 3), 24360, "large ordered selection");
expectEqual(permutation(18, 18), 6402373705728000, "largest safe factorial");

expectRangeError(permutation, -1, 0);
expectRangeError(permutation, 5, -1);
expectRangeError(permutation, 4, 5);
expectRangeError(permutation, 1.5, 1);
expectRangeError(permutation, Number.NaN, 1);
expectRangeError(permutation, Number.POSITIVE_INFINITY, 1);
expectRangeError(permutation, Number.MAX_SAFE_INTEGER + 1, 1);
expectRangeError(permutation, 19, 19);

expectPerformance(() => permutation(18, 18), 100_000, 500, "permutation");

console.log("permutation tests passed");
