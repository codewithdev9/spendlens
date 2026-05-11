# Metrics

## North Star Metric

**Audit completions per week** — a user who completes an audit (reaches the results page) has gotten value, is a potential email capture, and is a potential Credex lead. Views and sessions don't matter; only completions.

Why not email captures? Completions are a leading indicator that the product is working. If completions are high but email capture is low, the results page CTA needs work — fixable. If completions are low, the form is too long or the value prop isn't landing — fundamental.

Why not Credex consultations booked? Too downstream. At early stage, we don't have enough volume to observe weekly signal at the consultation level.

## 3 Input Metrics That Drive the North Star

1. **Landing page → form start rate** (target: ≥50%)
   - If below 40%, the hero copy or CTA isn't converting. A/B test the headline.
   - Measures: does the value proposition land on first impression?

2. **Form start → audit completion rate** (target: ≥70%)
   - If below 60%, the form is too complex or has a UX blocker. Check drop-off by step.
   - Measures: is the input experience frictionless enough?

3. **Audit completion → email capture rate** (target: ≥20%)
   - If below 15%, the results aren't compelling (savings too low, or presentation unclear).
   - Measures: did the audit deliver enough perceived value to earn an email?

## What We'd Instrument First

1. **Pageview → form start** — Mixpanel or PostHog event: `audit_form_started`
2. **Tool added** — `tool_added { toolId, plan, seats }` — lets us see which tools are most common
3. **Audit submitted** — `audit_submitted { toolCount, totalSpend, teamSize }` — completion funnel
4. **Results page viewed** — `audit_results_viewed { auditId, totalSavings, toolCount }`
5. **Email captured** — `lead_captured { auditId, monthlySavings, role }` — conversion event
6. **Share link copied / Twitter clicked** — `audit_shared { channel }` — viral loop signal

All events include `auditId` for funnel stitching. No PII in event properties.

## Pivot Trigger

**If audit completion rate drops below 40% for 2 consecutive weeks with ≥100 sessions:**
The form is too long or the value proposition isn't clear. Trigger: shorten the form to 3 fields (primary tool, plan, spend), show a "quick audit" mode, and re-measure.

**If email capture rate stays below 10% after 500 completions:**
The savings numbers aren't big enough to earn an email. Trigger: review whether the audit engine is being too conservative, or whether we need a "compare to benchmarks" feature to create more compelling outputs for low-spend users.

**If Credex consultation booking rate is <0.5% of completions after 1,000 completions:**
The high-savings CTA isn't landing. Trigger: A/B test the Credex section copy and placement on the results page. Also check: are we correctly identifying high-savings cases, or are most audits showing <$500/mo?
