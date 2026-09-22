import { modPow } from "../src/mod_pow.js";
import { expectEqual, expectPerformance, expectRangeError } from "./helpers.js";

expectEqual(modPow(2, 10, 1000), 24, "small exponent");
expectEqual(modPow(3, 0, 7), 1, "zero exponent");
expectEqual(modPow(0, 10, 7), 0, "zero base");
expectEqual(modPow(1, Number.MAX_SAFE_INTEGER, 7), 1, "unit base");
expectEqual(modPow(123, 1, 1000), 123, "unit exponent");
expectEqual(modPow(-2, 3, 5), 2, "negative base");
expectEqual(modPow(2, 32, 1_000_000_007), 294967268, "large modulus");
expectEqual(modPow(2, 4_294_967_297, 7), 4, "large safe exponent");
expectEqual(modPow(2, Number.MAX_SAFE_INTEGER, 1_000_000_007), 288_570_470, "maximum safe exponent");
expectEqual(modPow(123, 456, 1), 0, "unit modulus");

// Moduli above the exact Number product bound use the BigInt path and must
// stay exact, including at the boundary itself.
expectEqual(modPow(94_906_265, 2, 94_906_265), 0, "modulus at the Number bound");
expectEqual(
    modPow(Number.MAX_SAFE_INTEGER - 2, 4_294_967_291, 9_000_000_000_000_001),
    8_714_278_007_221_593,
    "large modulus"
);
expectEqual(modPow(2, 52, Number.MAX_SAFE_INTEGER), 4_503_599_627_370_496, "safe-integer modulus");
expectEqual(modPow(-2, 3, 9_007_199_254_740_881), 9_007_199_254_740_873, "negative base, large modulus");

// The Number and BigInt paths must agree on shared exponent structure.
for (const modulus of [94_906_265, 94_906_266, 1_000_000_007, 9_007_199_254_740_881]) {
    let expected = 1;
    for (let power = 0; power <= 40; power++) {
        expectEqual(modPow(3, power, modulus), expected, `3^${power} mod ${modulus}`);
        expected = Number((BigInt(expected) * 3n) % BigInt(modulus));
    }
}

expectRangeError(modPow, 1.5, 2, 3);
expectRangeError(modPow, 2, -1, 3);
expectRangeError(modPow, 2, 2, 0);
expectRangeError(modPow, Number.NaN, 2, 3);
expectRangeError(modPow, 2, Number.POSITIVE_INFINITY, 3);
expectRangeError(modPow, 2, 2, Number.MAX_SAFE_INTEGER + 1);

expectPerformance(
    () => modPow(123456789, 987654321, 1_000_000_007),
    100_000,
    1000,
    "modPow"
);

console.log("modPow tests passed");
