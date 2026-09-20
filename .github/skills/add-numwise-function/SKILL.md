---
name: add-numwise-function
description: Add a focused, performance-oriented numerical function to Numwise with strict TypeScript implementation, correctness and bounds tests, performance regression coverage, current-version changelog updates, and matching documentation. Use when adding a new standalone Numwise function.
---

# Add a Numwise Function

Use this workflow when adding a new standalone numerical function to Numwise.

## Goals and constraints

- Keep the function focused: implement one useful mathematical operation, not a broad utility framework.
- Do not wrap behavior that JavaScript already provides natively unless the wrapper adds materially better correctness or performance.
- Prefer algorithms that are measurably faster or more exact than typical implementations.
- Use TypeScript for all source and test files.
- Preserve the existing ESM/NodeNext project configuration.
- Do not change the package version as part of adding a function. The user updates versions separately.
- Do not add a new changelog version heading. Add the function under the current version heading.

## Workflow

### 1. Inspect the repository

Before editing, read:

- `package.json` for the current version, scripts, and module configuration
- `tsconfig.json` for compiler settings
- `index.ts` for public exports
- Existing related source and test files
- The current `changelog.md`
- At least one existing document in `Docs/`

Follow existing naming, formatting, and error-handling conventions.

### 2. Define the contract

Decide and document:

- Function name and signature
- Supported numeric domain
- Return value semantics
- Invalid-input behavior, usually `RangeError` for unsupported numeric inputs
- Boundary behavior, including zero, negative values, fractions, `NaN`, infinities, and unsafe integers where relevant
- Exactness guarantees and known limitations
- Algorithmic complexity

Do not silently coerce invalid inputs or return approximate results when the function promises exactness.

### 3. Implement the function

Create `src/<function_name>.ts`.

Requirements:

- Export a named function.
- Use explicit TypeScript parameter and return types.
- Keep hot paths allocation-free where practical.
- Avoid unnecessary arrays, strings, recursion, and generic abstractions in performance-sensitive code.
- Use safe integer arithmetic and avoid accidental 32-bit truncation from bitwise operators when values may exceed 32 bits.
- Add concise JSDoc describing the contract and thrown errors.
- Reuse existing internal primitives only when doing so does not harm the hot path.

### 4. Export publicly

Add the function to `index.ts` using the project’s NodeNext-compatible `.js` import specifier:

```ts
export { functionName } from "./src/function_name.js";
```

### 5. Add tests

Create `test/<function_name>.test.ts`.

Tests must include:

- Normal valid inputs
- At least two accuracy/correctness cases with independently obvious expected results
- Boundary cases
- Invalid bounds and invalid numeric categories where relevant:
  - negative values
  - zero
  - fractions
  - `NaN`
  - positive and negative infinity
  - values above `Number.MAX_SAFE_INTEGER`
- Large safe-integer cases when the function supports them
- Edge cases specific to the algorithm

For exact functions, test the defining invariant, not only a few expected outputs. For example, an integer square-root result `r` should satisfy:

$$
r^2 \leq n < (r + 1)^2
$$

Use small local assertion helpers if no test framework is installed. Keep tests executable with the repository’s existing test command.

### 6. Add a performance regression test

Include a deterministic repeated-call benchmark in the function’s test file.

Requirements:

- Use a representative workload, including large values when supported.
- Repeat enough times to exercise the hot path.
- Set a generous environment-tolerant upper bound; do not make tests flaky by using a machine-specific microbenchmark threshold.
- Fail with a clear message when the bound is exceeded.
- Do not claim a speed improvement without measuring a baseline.

### 7. Add documentation

Create `Docs/<function_name>.md`.

Use this format:

```md
# `functionName`

One-sentence description.

## Version history

- **`CURRENT_PACKAGE_VERSION`** — Added `functionName`.

## Signature

```ts
functionName(value: number): number
```

## Parameters

- `value` — Describe the accepted domain.

## Returns

Describe the result and exactness.

## Errors

Describe invalid inputs and thrown errors.

## Examples

```ts
import { functionName } from "numwise";

functionName(42);
```

## Algorithm and performance

Describe the algorithm, complexity, allocation behavior, and any important accuracy guarantees.
```

Use the package version from `package.json` for the initial `Version history` entry; do not bump it. If the package version has `-dev` suffix, use the base version without the `-dev` suffix. Keep the entry limited to the fact that the function was added. Put the newest version first, followed by older entries. Add only later function behavior or algorithm changes as additional entries. Do not add test coverage, benchmark results, or other development activity to Version history.

### 8. Update the changelog

Update the existing current-version section in `changelog.md`.

- Add one concise bullet describing the new function.
- Never create a new version heading unless the user explicitly asks for a release.
- Never overwrite existing entries.

Example:

```md
## [0.1.1] - YYYY-MM-DD

- Added `functionName`, a fast exact implementation for supported safe integers.
- Added accuracy, bounds, and performance regression tests.
```

### 9. Validate

Run diagnostics on every changed TypeScript, JSON, Markdown, and configuration file.

Then run the project test command from `package.json`.

If execution is blocked by the environment, report that separately; do not claim the tests passed. Fix all compiler and test failures before finishing.

## Completion checklist

- [ ] Function added under `src/` in TypeScript
- [ ] Publicly exported from `index.ts`
- [ ] Contract and invalid-input behavior are explicit
- [ ] Accuracy tests added
- [ ] Bounds and invalid-input tests added
- [ ] Large-value tests added where applicable
- [ ] Performance regression test added
- [ ] Documentation added under `Docs/`
- [ ] Documentation includes the current package version in `Added in`
- [ ] Changelog updated under the existing current version
- [ ] Package version left unchanged
- [ ] Diagnostics are clear
- [ ] Test command passes
