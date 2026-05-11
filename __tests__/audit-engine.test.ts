import { runAudit } from "../lib/audit-engine";
import { AuditFormData } from "../lib/types";

// Test 1: Cursor Business with small team should recommend downgrade to Pro
test("Cursor Business with ≤3 users recommends downgrade to Pro", async () => {
  const formData: AuditFormData = {
    tools: [{ toolId: "cursor", plan: "business", monthlySpend: 80, seats: 2 }],
    teamSize: 2,
    useCase: "coding",
  };
  const result = await runAudit(formData);
  const cursorResult = result.toolResults.find((r) => r.toolId === "cursor")!;
  expect(cursorResult.recommendation.type).toBe("downgrade");
  expect(cursorResult.recommendation.monthlySavings).toBe(40); // $40/seat × 2 seats = $80 business - $40 pro
});

// Test 2: Claude Team with <5 seats should recommend downgrade to Pro
test("Claude Team with fewer than 5 seats recommends downgrade to Pro", async () => {
  const formData: AuditFormData = {
    tools: [{ toolId: "claude", plan: "team", monthlySpend: 60, seats: 2 }],
    teamSize: 2,
    useCase: "writing",
  };
  const result = await runAudit(formData);
  const claudeResult = result.toolResults.find((r) => r.toolId === "claude")!;
  expect(claudeResult.recommendation.type).toBe("downgrade");
  expect(claudeResult.recommendation.monthlySavings).toBeGreaterThan(0); // $30*2 - $20*2 = $20
});

// Test 3: Total savings should sum all per-tool savings
test("Total monthly savings equals sum of per-tool savings", async () => {
  const formData: AuditFormData = {
    tools: [
      { toolId: "cursor", plan: "business", monthlySpend: 80, seats: 2 },
      { toolId: "claude", plan: "team", monthlySpend: 60, seats: 2 },
    ],
    teamSize: 2,
    useCase: "mixed",
  };
  const result = await runAudit(formData);
  const expectedTotal = result.toolResults.reduce((s, r) => s + r.recommendation.monthlySavings, 0);
  expect(result.totalMonthlySavings).toBe(expectedTotal);
});

// Test 4: Annual savings should be 12x monthly savings
test("Annual savings is exactly 12x monthly savings", async () => {
  const formData: AuditFormData = {
    tools: [{ toolId: "cursor", plan: "business", monthlySpend: 120, seats: 3 }],
    teamSize: 3,
    useCase: "coding",
  };
  const result = await runAudit(formData);
  expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
});

// Test 5: Optimal spend should have isOptimal = true and < $100 savings
test("Well-optimized spend returns isOptimal=true", async () => {
  const formData: AuditFormData = {
    tools: [{ toolId: "cursor", plan: "pro", monthlySpend: 60, seats: 3 }],
    teamSize: 3,
    useCase: "coding",
  };
  const result = await runAudit(formData);
  expect(result.isOptimal).toBe(true);
  expect(result.totalMonthlySavings).toBeLessThan(100);
});

// Test 6: Redundant tools (Cursor + Copilot) should flag overlap
test("Running Cursor Pro and GitHub Copilot flags redundancy", async () => {
  const formData: AuditFormData = {
    tools: [
      { toolId: "cursor", plan: "pro", monthlySpend: 100, seats: 5 },
      { toolId: "github_copilot", plan: "individual", monthlySpend: 50, seats: 5 },
    ],
    teamSize: 5,
    useCase: "coding",
  };
  const result = await runAudit(formData);
  const copilotResult = result.toolResults.find((r) => r.toolId === "github_copilot")!;
  // Redundancy check or switch recommendation should fire
  expect(["switch", "downgrade"]).toContain(copilotResult.recommendation.type);
  expect(result.totalMonthlySavings).toBeGreaterThan(0);
});

// Test 7: High API spend triggers credits recommendation
test("Anthropic API spend over $500/mo triggers credits recommendation", async () => {
  const formData: AuditFormData = {
    tools: [{ toolId: "anthropic_api", plan: "api", monthlySpend: 800, seats: 1 }],
    teamSize: 5,
    useCase: "coding",
  };
  const result = await runAudit(formData);
  const apiResult = result.toolResults.find((r) => r.toolId === "anthropic_api")!;
  expect(apiResult.recommendation.type).toBe("credits");
  expect(apiResult.recommendation.monthlySavings).toBeGreaterThan(0);
});

// Test 8: Result has a valid nanoid
test("Audit result has a valid ID", async () => {
  const formData: AuditFormData = {
    tools: [{ toolId: "claude", plan: "pro", monthlySpend: 40, seats: 2 }],
    teamSize: 2,
    useCase: "writing",
  };
  const result = await runAudit(formData);
  expect(result.id).toBeTruthy();
  expect(result.id.length).toBeGreaterThanOrEqual(8);
});
