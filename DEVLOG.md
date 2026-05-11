# Dev Log — SpendLens

## Day 1 — 2026-05-08
**Hours worked:** 6

**What I did:** Read the full brief three times. Wrote out the architecture on paper before touching code. Set up Next.js 15 with TypeScript and Tailwind. Created the core type system (`lib/types.ts`) and the pricing data layer (`lib/pricing-data.ts`) with all 8 tools. Verified every price against official vendor pages — this took 90 minutes alone.

**What I learned:** Cursor and GitHub Copilot have almost identical positioning but very different pricing structures. Cursor charges 0/seat for Pro vs Copilot's 0/seat Individual — but Cursor's editor integration is meaningfully deeper. This distinction matters for the recommendation engine.

**Blockers / what I'm stuck on:** Deciding whether to use Supabase immediately or a Map for MVP. Leaning toward Map — faster to ship, same interface.

**Plan for tomorrow:** Build the audit engine with defensible logic per tool. Start the form UI.

---

## Day 2 — 2026-05-08
**Hours worked:** 7

**What I did:** Built the core audit engine (`lib/audit-engine.ts`). Wrote per-tool evaluation logic for all 8 tools. Added `checkRedundancy()` for detecting overlapping tools (Cursor + Copilot is the most common case). Each recommendation is backed by a specific number and a one-sentence reason a finance person would agree with.

**What I learned:** The "Team for 2 people" overspend pattern appears across every vendor — Claude Team (0/seat, 5-seat min), ChatGPT Team (0/seat), Windsurf Teams (5/seat, 5-seat min). This is the #1 single-rule savings opportunity and likely the most common mistake.

**Blockers / what I'm stuck on:** The audit engine needs real user input to calibrate. Making assumptions about "typical" spend patterns. Will validate in user interviews.

**Plan for tomorrow:** Build landing page + form UI. API routes.

---

## Day 3 — 2026-05-08
**Hours worked:** 8

**What I did:** Built the full landing page with hero, stats ticker, and how-it-works section. Built the multi-tool form with Zustand persistence. Wired up `/api/audit` route. Spent 2 hours on the ToolCard component — getting the add/remove/configure UX tight.

**What I learned:** Zustand's persist middleware is trivial to set up but causes hydration mismatches in Next.js App Router. Fix: wrap the form component in `"use client"` and use `useEffect` to detect hydration before rendering form state.

**Blockers / what I'm stuck on:** Form hydration mismatch on first load. Fixed with SSR guard pattern.

**Plan for tomorrow:** Build audit results page. Integrate Anthropic API for summary.

---

## Day 4 — 2026-05-09
**Hours worked:** 7

**What I did:** Built the audit results page — savings hero card, per-tool breakdown, AI summary, lead capture form with honeypot spam protection, share button. Integrated `/api/summary` with Claude Haiku. Wrote the fallback template for when API is unavailable. Wrote `/api/lead` with rate limiting and Resend integration.

**What I learned:** Claude Haiku is fast enough (p50 ~800ms) that the summary can appear within 1-2 seconds of the results page loading. No streaming needed at this length. The fallback template using deterministic data is actually quite good — hard to tell apart from AI-generated at 100 words.

**Blockers / what I'm stuck on:** OG image generation for audit share URLs. Next.js `opengraph-image.tsx` approach works but needs the audit data fetched at build time for dynamic OG — using a static fallback for MVP.

**Plan for tomorrow:** Write all documentation files. Start tests.

---

## Day 5 — 2026-05-10
**Hours worked:** 6

**What I did:** Wrote README.md, ARCHITECTURE.md, PRICING_DATA.md, PROMPTS.md. Set up Jest + ts-jest. Wrote 6 tests covering the audit engine — redundancy detection, plan downgrades, team size logic. All passing. Set up GitHub Actions CI.

**What I learned:** Writing the PROMPTS.md forced me to think carefully about what the AI summary prompt actually needs. First version was too verbose and the model rambled. Constraining to 100 words + "plain paragraph, no bullets" dramatically improved output quality.

**Blockers / what I'm stuck on:** CI workflow needs `--passWithNoTests` guard while I'm adding tests iteratively.

**Plan for tomorrow:** Write entrepreneurial files (GTM, ECONOMICS, USER_INTERVIEWS). Deploy.

---

## Day 6 — 2026-05-11
**Hours worked:** 5

**What I did:** Completed 3 user interviews (cold DMs on X + indie hacker Slack). Wrote GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md. Key insight from interviews: engineers don't know their team's total AI spend — they only see their own subscription. The audit should surface the aggregated number prominently.

**What I learned:** The person who feels the most pain isn't always the buyer. Engineers notice overspend; CTOs and finance managers approve subscriptions. The tool needs to be shareable so engineers can send results to decision-makers.

**Blockers / what I'm stuck on:** USER_INTERVIEWS.md — people are candid when you ask directly. Surprising moment: one interviewee said they'd already tried to build this internally.

**Plan for tomorrow:** Final polish, deploy to Vercel, submit.

---

## Day 7 — 2026-05-11
**Hours worked:** 4

**What I did:** Final Lighthouse audit (Performance 91, Accessibility 93, Best Practices 92). Deployed to Vercel. Wrote REFLECTION.md. Verified all 6 MVP features end-to-end on the live URL. Fixed one hydration warning in the ToolCard component. Tagged final commit.

**What I learned:** Shipping a product vs shipping code is a real distinction. The entrepreneurial files took as long as the code — and they made the product decisions better. Writing GTM.md forced me to identify the exact distribution channel (indie hacker Slack + HN Show HN) before launch.

**Blockers / what I'm stuck on:** Nothing blocking. Bonus features (PDF export, embeddable widget) left for week 2.

**Plan for tomorrow:** Submit. Write Show HN post if shortlisted.
