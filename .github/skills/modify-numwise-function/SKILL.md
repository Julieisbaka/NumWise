---
name: modify-numwise-function
description: Modify an existing Numwise numerical function while preserving its public contract, adding regression coverage, documenting versioned behavior changes, updating the current changelog, and validating performance. Use when changing an existing standalone Numwise function.
---

# Modify a Numwise Function

Use this workflow when changing an existing standalone function in Numwise.

## Goals and constraints

- Preserve the existing public API unless the user explicitly requests a breaking change.
- Keep the function standalone; do not introduce dependencies on other public Numwise functions without a clear reason.
- Prefer changes that improve measured speed, exactness, bounds handling, or correctness.
- Use TypeScript and preserve the ESM/NodeNext configuration.
- Do not bump the package version unless the user explicitly asks. The user manages releases.
- Never remove existing behavior or tests without documenting why.

## Workflow

### 1. Inspect before editing

Read:

- `package.json` for the current version and test/build scripts
- `tsconfig.json`
- `index.ts`
- The target source file and its tests
- The matching file in `Docs/`
- `changelog.md`
- Any related internal code used by the target function

Identify the current contract, performance assumptions, supported bounds, error behavior, and known edge cases.

### 2. Define the change

Write down the exact behavior being changed:

- What inputs or outputs change?
- Is the public signature unchanged?
- Which invalid-input and boundary cases are affected?
- Does exactness improve or does the supported range change?
- What is the expected performance impact?

Do not make an optimization that changes correctness. Avoid bitwise operators for values that may exceed JavaScript’s 32-bit range.

### 3. Modify the implementation

Edit `src/<function_name>.ts` with the smallest focused change.

Requirements:

- Keep explicit TypeScript types and JSDoc accurate.
- Preserve allocation-free hot paths where practical.
- Keep fallback paths exact and clearly separated from fast paths.
- Avoid unrelated refactoring.
- Preserve or improve error validation.

### 4. Add regression tests

Update `test/<function_name>.test.ts` with tests that fail under the old behavior and pass under the new behavior.

Include, when relevant:

- The original successful cases to prevent regressions
- The exact bug or boundary that motivated the change
- Invalid values and bounds
- Large safe-integer cases
- Known adversarial inputs, such as pseudoprimes or overflow-producing intermediates
- Mathematical invariants for exact functions

Keep the existing performance regression test. Update it only if the workload no longer represents the implementation.

### 5. Verify performance

Benchmark the changed hot path against the previous implementation or a representative baseline when possible.

- Use repeatable inputs.
- Use a tolerant threshold that avoids machine-specific flakes.
- Report measured results rather than assuming an optimization helped.
- Ensure correctness fallbacks do not accidentally run on the common path.

### 6. Document versioned changes

Update `Docs/<function_name>.md` without changing the original **Added in** version.

Add or update the reusable version history:

```md
## Version history

- **`CURRENT_PACKAGE_VERSION`** — Describe the specific behavior or algorithm change.
- **`CURRENT_PACKAGE_VERSION`** — Describe any changed bounds, exactness, or fallback behavior.
- **`ORIGINAL_VERSION`** — Added `functionName`.
```

Add future entries at the top of `Version history` rather than creating a version-specific heading. A later change must use a version newer than the function’s original addition; if implementation details are part of the initial release, describe them in the original addition entry instead. Keep tests, benchmarks, and other development activity out of Version history. Make each change immediately understandable. Do not merely say “optimized” or “fixed”; state what changed and why.

### 7. Update the changelog

Add entries under the existing current-version heading in `changelog.md`.

- Add a short release summary sentence if the changes are not immediately obvious.
- Add one bullet for each meaningful behavior or algorithm change.
- Do not create a new version heading unless explicitly requested.
- Do not overwrite existing release notes.

### 8. Validate

Run diagnostics on every changed file, then run the project test command from `package.json`.

If tests fail:

1. Capture the exact failing assertion or compiler error.
2. Determine whether the failure is in implementation, test data, module configuration, or environment setup.
3. Fix the root cause.
4. Rerun the full suite.

Do not claim success when execution was blocked.

## Completion checklist

- [ ] Existing contract reviewed and preserved or intentionally changed
- [ ] Implementation change is focused
- [ ] Regression test fails under old behavior and passes under new behavior
- [ ] Boundary and invalid-input behavior covered
- [ ] Performance regression coverage preserved or updated
- [ ] Docs include the original addition in Version history
- [ ] Docs include later changes in Version history
- [ ] Docs include a clear, appendable Version history section
- [ ] Current changelog updated without a new version heading
- [ ] Package version unchanged unless explicitly requested
- [ ] Diagnostics clear
- [ ] Full test suite passes
