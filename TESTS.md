# Tests

All tests cover the audit engine specifically, as required. Tests are in `__tests__/audit-engine.test.ts`.

## Test Suite

| File | Test | What it covers | How to run |
|------|------|---------------|------------|
| `__tests__/audit-engine.test.ts` | Cursor Business ≤3 users → downgrade to Pro | Verifies downgrade logic fires for small teams on Business plan; savings = ($40-$20) × seats | `npm test` |
| `__tests__/audit-engine.test.ts` | Claude Team <5 seats → downgrade to Pro | Team plan min-seat requirement logic | `npm test` |
| `__tests__/audit-engine.test.ts` | Total savings = sum of per-tool savings | Arithmetic integrity of aggregation | `npm test` |
| `__tests__/audit-engine.test.ts` | Annual savings = 12× monthly savings | Annual savings calculation | `npm test` |
| `__tests__/audit-engine.test.ts` | Optimal spend returns isOptimal=true | Correctly-optimized stack returns no false positives | `npm test` |
| `__tests__/audit-engine.test.ts` | Cursor + Copilot redundancy flagged | Redundancy detection for overlapping IDE tools | `npm test` |
| `__tests__/audit-engine.test.ts` | High Anthropic API spend → credits recommendation | Credits type recommendation triggers at >$500/mo | `npm test` |
| `__tests__/audit-engine.test.ts` | Result has valid ID | nanoid generation and result shape | `npm test` |

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npx jest __tests__/audit-engine.test.ts
```

## Expected Output

```
PASS __tests__/audit-engine.test.ts
  ✓ Cursor Business with ≤3 users recommends downgrade to Pro
  ✓ Claude Team with fewer than 5 seats recommends downgrade to Pro
  ✓ Total monthly savings equals sum of per-tool savings
  ✓ Annual savings is exactly 12x monthly savings
  ✓ Well-optimized spend returns isOptimal=true
  ✓ Running Cursor Pro and GitHub Copilot flags redundancy
  ✓ Anthropic API spend over $500/mo triggers credits recommendation
  ✓ Audit result has a valid ID

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```
