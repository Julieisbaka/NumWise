import { expectEqual, expectPerformance, expectRangeError } from "./helpers.js";
import { lcm } from "../src/lcm.js";

expectEqual(lcm(4, 6), 12, "common multiple");
expectEqual(lcm(21, 6), 42, "non-coprime values");
expectEqual(lcm(-4, 6), 12, "negative first argument");
expectEqual(lcm(-4, -6), 12, "both arguments negative");
expectEqual(lcm(0, 24), 0, "zero first argument");
expectEqual(lcm(0, 0), 0, "both arguments zero");
expectEqual(lcm(1, Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER, "unit first argument");
expectEqual(lcm(Number.MAX_SAFE_INTEGER, 1), Number.MAX_SAFE_INTEGER, "unit second argument");
expectEqual(lcm(-42, 42), 42, "equal absolute values");
expectEqual(lcm(Number.MAX_SAFE_INTEGER, 1), Number.MAX_SAFE_INTEGER, "safe boundary");
expectEqual(lcm(6, 24), 24, "divisible values");
expectEqual(lcm(94_906_265, 94_906_264), 9_007_199_041_343_960, "large safe result");

expectRangeError(lcm, 1.5, 3);
expectRangeError(lcm, Number.NaN, 3);
expectRangeError(lcm, Number.POSITIVE_INFINITY, 3);
expectRangeError(lcm, Number.MAX_SAFE_INTEGER + 1, 3);
expectRangeError(lcm, Number.MAX_SAFE_INTEGER, 2);

expectEqual(lcm(48, 18) % 48, 0, "multiple of first argument");
expectEqual(lcm(48, 18) % 18, 0, "multiple of second argument");

expectPerformance(() => lcm(987654, 123456), 100_000, 500, "lcm");

console.log("lcm tests passed");
