import { gcd } from "../src/gcd.js";
import { expectEqual, expectPerformance, expectRangeError } from "./helpers.js";

expectEqual(gcd(48, 18), 6, "common factors");
expectEqual(gcd(17, 13), 1, "coprime values");
expectEqual(gcd(0, 24), 24, "zero first argument");
expectEqual(gcd(24, 0), 24, "zero second argument");
expectEqual(gcd(0, 0), 0, "both arguments zero");
expectEqual(gcd(-48, 18), 6, "negative first argument");
expectEqual(gcd(48, -18), 6, "negative second argument");
expectEqual(gcd(-48, -18), 6, "both arguments negative");
expectEqual(gcd(42, 42), 42, "equal values");
expectEqual(gcd(144, 12), 12, "divisible values");
expectEqual(gcd(4_294_967_295, 4_294_967_293), 1, "unsigned 32-bit fast-path boundary");
expectEqual(gcd(4_294_967_296, 2), 2, "value above unsigned 32-bit fast path");
expectEqual(gcd(6, Number.MAX_SAFE_INTEGER), 1, "large values");
expectEqual(gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693), 1, "large coprime values");
expectEqual(gcd(Number.MAX_SAFE_INTEGER, 0), Number.MAX_SAFE_INTEGER, "safe boundary");

expectRangeError(gcd, 1.5, 3);
expectRangeError(gcd, Number.NaN, 3);
expectRangeError(gcd, Number.POSITIVE_INFINITY, 3);
expectRangeError(gcd, Number.MAX_SAFE_INTEGER + 1, 3);
expectRangeError(gcd, 3, Number.MAX_SAFE_INTEGER + 1);

expectPerformance(
	() => gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693),
	100_000,
	500,
	"gcd"
);

console.log("gcd tests passed");
