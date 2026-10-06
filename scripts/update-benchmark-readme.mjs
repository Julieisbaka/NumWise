import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import process from "node:process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const benchmarkPath = join(root, "dist", "test", "comparison-benchmarks.js");
const readmePath = join(root, "README.md");
const benchmark = spawnSync(process.execPath, [benchmarkPath], {
    cwd: root,
    encoding: "utf8"
});

if (benchmark.error) throw benchmark.error;
if (benchmark.status !== 0) {
    process.stderr.write(benchmark.stderr);
    process.exit(benchmark.status ?? 1);
}

const tables = [...benchmark.stdout.matchAll(/Markdown:\r?\n((?:\|[^\r\n]*(?:\r?\n|$))+)/g)]
    .map((match) => match[1].trimEnd());
const cases = [...benchmark.stdout.matchAll(/^([A-Za-z][A-Za-z0-9/]+) \(([0-9,]+) iterations\)$/gm)];

if (tables.length !== cases.length + 2) {
    throw new Error(
        `Unexpected comparison benchmark output: found ${tables.length} Markdown tables for ${cases.length} cases.`
    );
}

const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
}).format(new Date());
const snapshot = [
    `The following results were measured on ${date}. Times are elapsed`,
    "milliseconds for the listed iteration count; lower is better within the same",
    "table. `Max` is the slowest of seven samples. Package initialization is",
    "outside the timed region. Results vary with hardware, Node.js/V8, thermal",
    "conditions, and background activity, so run `npm run benchmark:compare`",
    "locally before making performance decisions.",
    "",
    tables[0],
    "",
    tables[1],
    "",
    ...cases.flatMap((benchmarkCase, index) => {
        const [, name, iterations] = benchmarkCase;
        return [
            `#### \`${name}\` — ${iterations} iterations`,
            "",
            tables[index + 2],
            ""
        ];
    }),
    "An asterisk marks an adapter that may return an inexact Number instead of",
    "rejecting an unrepresentable result. `big-integer` rows include conversion",
    "from Number inputs and conversion back; `mathjs` rows include its normal",
    "numeric dispatch. See the benchmark guide for the complete fairness and",
    "API-compatibility notes."
].join("\n");

const startMarker = "<!-- comparison-benchmark:start -->";
const endMarker = "<!-- comparison-benchmark:end -->";
const readme = readFileSync(readmePath, "utf8");
const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker);

if (start === -1 || end === -1 || end < start || readme.indexOf(startMarker, start + 1) !== -1) {
    throw new Error("README must contain exactly one correctly ordered comparison benchmark marker pair.");
}

const updatedReadme = `${readme.slice(0, start + startMarker.length)}\n${snapshot}\n${readme.slice(end)}`;
writeFileSync(readmePath, updatedReadme, "utf8");
process.stdout.write(benchmark.stdout);
process.stdout.write(`Updated README.md comparison snapshot (${date}).\n`);
