import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { cpus, platform, release, arch, version as nodeVersion } from "node:os";
import { combination } from "../src/combination.js";
import { gcd } from "../src/gcd.js";
import { isPrime } from "../src/is_prime.js";
import { lcm } from "../src/lcm.js";
import { modPow } from "../src/mod_pow.js";
import { primeFactors } from "../src/prime_factors.js";
import { primesUpTo } from "../src/primes_up_to.js";
import bigInt from "big-integer";
import { all, create } from "mathjs";

type Result = number | boolean | number[];
type Operation = (iteration: number) => Result;

interface NumberTheoryApi {
    readonly gcd: (a: number, b: number) => number;
    readonly isPrime: (value: number) => boolean;
    readonly powerMod: (base: number, exponent: number, modulus: number) => number;
    readonly primeFactors: (value: number) => number[];
    readonly sieve: (limitExclusive: number) => number[];
}

interface MathjsApi {
    readonly gcd: (a: number, b: number) => number;
    readonly lcm: (a: number, b: number) => number;
    readonly isPrime: (value: number) => boolean;
}

interface Case {
    readonly name: string;
    readonly iterations: number;
    readonly expected: Result;
    readonly implementations: readonly Implementation[];
}

interface Implementation {
    readonly name: string;
    readonly operation: Operation;
    readonly mayReturnInexactNumber: boolean;
}

const require = createRequire(import.meta.url);
const numberTheory = require("number-theory") as NumberTheoryApi;
const computeGcd = require("compute-gcd") as (a: number, b: number) => number;
const math = create(all) as unknown as MathjsApi;

const packageVersion = (name: string): string => {
    if (name === "numwise") {
        const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
            readonly version: string;
        };
        return packageJson.version;
    }
    const packageJson = require(`${name}/package.json`) as { readonly version: string };
    return packageJson.version;
};

const implementation = (
    name: string,
    operation: Operation,
    mayReturnInexactNumber = false
): Implementation => ({ name, operation, mayReturnInexactNumber });
const numwise = (
    name: string,
    operation: Operation,
    mayReturnInexactNumber = false
): Implementation => implementation(`numwise ${name}`, operation, mayReturnInexactNumber);
const competitor = (
    name: string,
    operation: Operation,
    mayReturnInexactNumber = false
): Implementation => implementation(name, operation, mayReturnInexactNumber);
const displayName = (value: Implementation): string =>
    `${value.name}${value.mayReturnInexactNumber ? "*" : ""}`;

const sameResult = (actual: Result, expected: Result): boolean => {
    if (Array.isArray(actual) && Array.isArray(expected)) {
        return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
    }
    return actual === expected;
};

const checksum = (result: Result): number => {
    if (typeof result === "number") return result;
    if (typeof result === "boolean") return result ? 1 : 0;
    return result.length === 0 ? 0 : result.length + result[0] + result[result.length - 1];
};

const rotatingGcdInputs = [
    [48, 18],
    [84, 30],
    [126, 60],
    [210, 24]
] as const;

const cases: readonly Case[] = [
    {
        name: "gcd/large",
        iterations: 20_000,
        expected: 1,
        implementations: [
            numwise("gcd", () => gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693)),
            competitor("number-theory gcd", () => numberTheory.gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693)),
            competitor("compute-gcd", () => computeGcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693)),
            competitor("big-integer gcd", () => bigInt.gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693).toJSNumber()),
            competitor("mathjs gcd", () => math.gcd(Number.MAX_SAFE_INTEGER, 2_305_843_009_213_693))
        ]
    },
    {
        name: "lcm/safe-integer",
        iterations: 20_000,
        expected: 9_007_199_041_343_960,
        implementations: [
            numwise("lcm", () => lcm(94_906_265, 94_906_264)),
            competitor("big-integer lcm", () => bigInt.lcm(94_906_265, 94_906_264).toJSNumber(), true),
            competitor("mathjs lcm", () => math.lcm(94_906_265, 94_906_264), true)
        ]
    },
    {
        name: "isPrime/medium",
        iterations: 2_000,
        expected: true,
        implementations: [
            numwise("isPrime", () => isPrime(104_729)),
            competitor("number-theory isPrime", () => numberTheory.isPrime(104_729)),
            competitor("big-integer isPrime", () => bigInt(104_729).isPrime()),
            competitor("mathjs isPrime", () => math.isPrime(104_729))
        ]
    },
    {
        name: "modPow/large",
        iterations: 2_000,
        expected: 836_702_803,
        implementations: [
            numwise("modPow", () => modPow(982_451_653, 1_000_003, 1_000_000_007)),
            competitor("number-theory powerMod", () => numberTheory.powerMod(982_451_653, 1_000_003, 1_000_000_007), true),
            competitor("big-integer modPow", () => bigInt(982_451_653).modPow(1_000_003, 1_000_000_007).toJSNumber())
        ]
    },
    {
        name: "primeFactors/semiprime",
        iterations: 100,
        expected: [997, 1009],
        implementations: [
            numwise("primeFactors", () => primeFactors(997 * 1009)),
            competitor("number-theory primeFactors", () => numberTheory.primeFactors(997 * 1009))
        ]
    },
    {
        name: "primesUpTo/medium",
        iterations: 20,
        expected: primesUpTo(100_000),
        implementations: [
            numwise("primesUpTo", () => primesUpTo(100_000)),
            // number-theory's documented API is exclusive; +1 gives the same <= 100000 result.
            competitor("number-theory sieve", () => numberTheory.sieve(100_001))
        ]
    },
    {
        name: "gcd/small",
        iterations: 30_000,
        expected: 6,
        implementations: [
            numwise("gcd", (iteration) => {
                const [left, right] = rotatingGcdInputs[iteration % rotatingGcdInputs.length];
                return gcd(left, right);
            }),
            competitor("number-theory gcd", (iteration) => {
                const [left, right] = rotatingGcdInputs[iteration % rotatingGcdInputs.length];
                return numberTheory.gcd(left, right);
            }),
            competitor("compute-gcd", (iteration) => {
                const [left, right] = rotatingGcdInputs[iteration % rotatingGcdInputs.length];
                return computeGcd(left, right);
            }),
            competitor("big-integer gcd", (iteration) => {
                const [left, right] = rotatingGcdInputs[iteration % rotatingGcdInputs.length];
                return bigInt.gcd(left, right).toJSNumber();
            }),
            competitor("mathjs gcd", (iteration) => {
                const [left, right] = rotatingGcdInputs[iteration % rotatingGcdInputs.length];
                return math.gcd(left, right);
            })
        ]
    },
    {
        name: "combination/context",
        iterations: 10_000,
        expected: 184_756,
        implementations: [numwise("combination", () => combination(20, 10))]
    }
];

const warmups = 3;
const samples = 7;

const shuffled = <T>(values: readonly T[], seed: number): T[] => {
    const result = [...values];
    let state = seed;
    for (let index = result.length - 1; index > 0; index--) {
        state = (state * 1_664_525 + 1_013_904_223) >>> 0;
        const swapIndex = state % (index + 1);
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
};

const run = (implementation: Implementation, benchmarkCase: Case): { median: number; max: number; checksum: number } => {
    let result = implementation.operation(0);
    let consumed = checksum(result);
    if (!sameResult(result, benchmarkCase.expected)) {
        throw new Error(`${implementation.name} failed ${benchmarkCase.name} correctness check`);
    }

    for (let warmup = 0; warmup < warmups; warmup++) {
        for (let iteration = 0; iteration < benchmarkCase.iterations; iteration++) {
            result = implementation.operation(iteration);
            consumed += checksum(result);
        }
    }

    const timings: number[] = [];
    for (let sample = 0; sample < samples; sample++) {
        const start = performance.now();
        for (let iteration = 0; iteration < benchmarkCase.iterations; iteration++) {
            result = implementation.operation(iteration);
            consumed += checksum(result);
        }
        timings.push(performance.now() - start);
    }
    timings.sort((left, right) => left - right);
    return {
        median: timings[Math.floor(timings.length / 2)],
        max: timings[timings.length - 1],
        checksum: consumed
    };
};

const printTables = (
    headers: readonly string[],
    rows: readonly (readonly string[])[],
    rightAlignedColumns: readonly number[] = [],
    boldMinimumColumns: readonly number[] = []
): void => {
    const widths = headers.map((header, column) => Math.max(
        header.length,
        ...rows.map((row) => row[column]?.length ?? 0)
    ));
    const separator = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
    const formatRow = (row: readonly string[]): string => `| ${row.map((value, column) =>
        value.padEnd(widths[column])).join(" | ")} |`;

    console.log(separator);
    console.log(formatRow(headers));
    console.log(separator);
    for (const row of rows) console.log(formatRow(row));
    console.log(separator);

    const rightAligned = new Set(rightAlignedColumns);
    const escapeMarkdown = (value: string): string => value
        .replace(/\\/g, "\\\\")
        .replace(/\|/g, "\\|")
        .replace(/\r?\n/g, "<br>");
    const markdownRow = (row: readonly string[]): string =>
        `| ${row.map(escapeMarkdown).join(" | ")} |`;
    const markdownSeparator = headers.map((_, column) =>
        rightAligned.has(column) ? "---:" : "---");
    const minimums = new Map(boldMinimumColumns.map((column) => [
        column,
        Math.min(...rows.map((row) => Number.parseFloat(row[column])))
    ]));
    const markdownDataRow = (row: readonly string[]): string => `| ${row.map((value, column) => {
        const escaped = escapeMarkdown(value);
        return Number.parseFloat(value) === minimums.get(column) ? `**${escaped}**` : escaped;
    }).join(" | ")} |`;

    console.log("Markdown:");
    console.log(markdownRow(headers));
    console.log(markdownRow(markdownSeparator));
    for (const row of rows) console.log(markdownDataRow(row));
};

console.log(`numwise comparison benchmark | Node ${process.version} | ${platform()} ${arch()} ${release()}`);
printTables(
    ["Environment", "Value"],
    [
        ["Node", process.version],
        ["Platform", `${platform()} ${arch()} ${release()}`],
        ["CPU", cpus()[0]?.model ?? "unknown"],
        ["OS", nodeVersion()]
    ]
);
printTables(
    ["Package", "Version"],
    [
        ["numwise", packageVersion("numwise")],
        ["number-theory", packageVersion("number-theory")],
        ["compute-gcd", packageVersion("compute-gcd")],
        ["big-integer", packageVersion("big-integer")],
        ["mathjs", packageVersion("mathjs")]
    ],
    [1]
);
console.log("Times are elapsed milliseconds for the listed iterations; setup is outside the timed region.");
console.log("big-integer includes Number-to-big-integer conversion and conversion back; mathjs includes its numeric dispatch.");
console.log("* This adapter may return an inexact Number instead of rejecting an unrepresentable result; the measured input is validated.");

for (const [caseIndex, benchmarkCase] of cases.entries()) {
    const rows: string[][] = [];
    for (const implementation of shuffled(benchmarkCase.implementations, caseIndex + 1)) {
        const result = run(implementation, benchmarkCase);
        rows.push([
            displayName(implementation),
            `${result.median.toFixed(2)} ms`,
            `${result.max.toFixed(2)} ms`,
            String(result.checksum)
        ]);
    }
    console.log(`\n${benchmarkCase.name} (${benchmarkCase.iterations} iterations)`);
    printTables(["Implementation", "Median", "Max", "Checksum"], rows, [1, 2, 3], [1, 2]);
}