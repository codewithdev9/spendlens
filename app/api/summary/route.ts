import { NextRequest, NextResponse } from "next/server";
import { AuditResult } from "@/lib/types";

function buildPrompt(audit: AuditResult): string {
  const toolSummaries = audit.toolResults
    .map((t) => `- ${t.toolName} (${t.currentPlan}, ${t.seats} seats, $${t.currentSpend}/mo): ${t.recommendation.action}. Saves $${t.recommendation.monthlySavings}/mo.`)
    .join("\n");

  return `You are a financial advisor specializing in AI tool spend optimization for startups. 
Write a personalized 100-word audit summary paragraph for this team.

Team profile:
- Size: ${audit.formData.teamSize} people
- Primary use case: ${audit.formData.useCase}
- Tools audited: ${audit.toolResults.map((t) => t.toolName).join(", ")}
- Total monthly savings identified: $${audit.totalMonthlySavings}
- Total annual savings identified: $${audit.totalAnnualSavings}

Per-tool findings:
${toolSummaries}

Write in second person ("you", "your team"). Be specific about the numbers. Be direct and non-fluffy. 
Mention the biggest single saving opportunity by name. If savings are under $100/mo, acknowledge 
they're already spending efficiently. End with one actionable next step.
Maximum 100 words. No bullet points. Plain paragraph only.`;
}

function fallbackSummary(audit: AuditResult): string {
  if (audit.isOptimal) {
    return `Your team's AI tool spend of $${audit.formData.tools.reduce((s, t) => s + t.monthlySpend, 0)}/mo across ${audit.toolResults.length} tool(s) is well-optimized for your ${audit.formData.useCase} workflows. No significant redundancies or overspend detected at current usage levels. To maintain this, set billing alerts and revisit plan tiers every quarter as your team grows — pricing changes frequently and a plan that fits today may be overkill in six months.`;
  }

  const biggestWin = [...audit.toolResults].sort(
    (a, b) => b.recommendation.monthlySavings - a.recommendation.monthlySavings
  )[0];

  return `Your team is spending $${audit.formData.tools.reduce((s, t) => s + t.monthlySpend, 0)}/mo on AI tools with $${audit.totalMonthlySavings}/mo ($${audit.totalAnnualSavings}/yr) in recoverable savings. The biggest opportunity is ${biggestWin.toolName}: ${biggestWin.recommendation.action.toLowerCase()}, saving $${biggestWin.recommendation.monthlySavings}/mo immediately. Implement the recommended plan changes this week — most can be done in under 10 minutes — and redirect those savings to headcount or growth spend.`;
}

export async function POST(req: NextRequest) {
  try {
    const { audit } = (await req.json()) as { audit: AuditResult };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Graceful fallback if no API key
      return NextResponse.json({ summary: fallbackSummary(audit) });
    }

    const prompt = buildPrompt(audit);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status);
      return NextResponse.json({ summary: fallbackSummary(audit) });
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text ?? fallbackSummary(audit);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summary error:", err);
    // Always graceful fallback
    const { audit } = await req.json().catch(() => ({ audit: null }));
    return NextResponse.json({
      summary: audit ? fallbackSummary(audit) : "Unable to generate summary at this time.",
    });
  }
}
