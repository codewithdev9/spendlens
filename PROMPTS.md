# LLM Prompts

## Audit Summary Prompt

Used in `/app/api/summary/route.ts` to generate the ~100-word personalized summary.

### Final Prompt

```
You are a financial advisor specializing in AI tool spend optimization for startups. 
Write a personalized 100-word audit summary paragraph for this team.

Team profile:
- Size: {teamSize} people
- Primary use case: {useCase}
- Tools audited: {toolNames}
- Total monthly savings identified: ${totalMonthlySavings}
- Total annual savings identified: ${totalAnnualSavings}

Per-tool findings:
{toolSummaries — one bullet per tool: name, plan, action, savings}

Write in second person ("you", "your team"). Be specific about the numbers. Be direct and non-fluffy. 
Mention the biggest single saving opportunity by name. If savings are under $100/mo, acknowledge 
they're already spending efficiently. End with one actionable next step.
Maximum 100 words. No bullet points. Plain paragraph only.
```

### Why this prompt was designed this way

**"You are a financial advisor"** — Not "AI assistant". Role-framing shifts the model toward specific, numbers-first language rather than hedged generic advice.

**"Be direct and non-fluffy"** — Without this, Claude tends to start with phrases like "Based on your audit, it appears that..." — three wasted words. Direct instruction eliminates these.

**"Mention the biggest single saving opportunity by name"** — Without this constraint, the model produces vague summaries about "significant savings potential." Naming the tool (e.g., "Cursor Business") is what makes the output actionable.

**"Maximum 100 words"** — Hard constraint. Model respects word limits well when stated explicitly. Without it, summaries were 150-200 words and the value was diluted.

**"No bullet points. Plain paragraph only"** — First versions would occasionally output bullet points despite the instruction to write a paragraph. Adding both constraints eliminated this.

### What didn't work

**v1 — No word limit, open-ended:** Output was 200+ words, mixed bullets and prose, and included unhelpful caveats ("prices may vary", "consult your accounting team").

**v2 — "Write a summary of the audit":** Too vague. Model summarized the *format* of the audit rather than giving personalized advice.

**v3 — Asking for JSON first, then prose:** Added latency with no quality benefit. Direct prose generation is better here.

### Fallback behavior

If the Anthropic API is unavailable (network error, 429, key not set), `fallbackSummary()` generates a deterministic summary using the same audit data. The fallback uses the same structure: current spend, biggest savings opportunity by name, and a next step. In user testing, blind reviewers couldn't reliably distinguish fallback from AI-generated summaries at 100 words.
