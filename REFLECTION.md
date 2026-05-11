# Reflection

## 1. The Hardest Bug — Zustand Hydration Mismatch

On Day 3, after wiring up form state persistence with Zustand's `persist` middleware, the form was rendering with empty tool data on first load even though localStorage had the saved state. The console showed a React hydration mismatch warning.

**Hypotheses I formed:**
1. Zustand wasn't loading from localStorage fast enough before the first render cycle completed
2. Next.js App Router was generating server-side HTML with default (empty) state, and the client hydration was then colliding with the persisted localStorage state — React detects the mismatch and throws
3. The `persist` middleware had a bug or incompatibility with the App Router's new RSC model

I tested hypothesis 1 by adding `console.log(useFormStore.getState())` inside a `useEffect` — it showed the persisted data arriving ~50ms after mount, confirming the issue was timing. That ruled it out as the root cause.

Hypothesis 2 was correct. Next.js App Router renders component trees on the server (with empty default Zustand state, since localStorage doesn't exist server-side), sends that HTML to the client, then React tries to "hydrate" that HTML by re-rendering with the same component tree — but now localStorage exists and Zustand loads persisted state, so the rendered output differs from the server HTML. React detects this mismatch and throws a hydration error.

**What I tried:**
- Adding `suppressHydrationWarning` to the form wrapper — this masked the error but didn't fix it
- Using `dynamic(() => import('./FormComponent'), { ssr: false })` — this worked but caused a flash of empty content
- Creating a `useHasHydrated()` hook that returns `false` until Zustand's internal `_hasHydrated` flag is true, and rendering a loading skeleton in the meantime — this was the cleanest fix

The skeleton approach won because it gives the user immediate feedback ("the page is loading") rather than a jarring flash of empty-then-populated content, and it doesn't suppress legitimate hydration warnings elsewhere.

---

## 2. A Decision I Reversed — Using AI for Audit Recommendations

My original plan on Day 1 was to use Claude to generate both the specific audit recommendations *and* the personalized summary paragraph. I wrote an initial prompt that would take tool data as JSON and output a structured recommendations object, then went to implement it on Day 2.

I reversed this halfway through Day 2 for two reasons — one from the brief, one practical.

The brief explicitly states: "For the audit math itself, hardcoded rules are correct — knowing when not to use AI is part of the test." Re-reading that stopped me cold. Using AI for recommendations would have been the wrong call even if it had worked perfectly.

The practical reason was stronger: AI-generated financial recommendations are non-deterministic. Running the same input twice produces different outputs. The numbers can shift slightly. More critically, the *reasoning* can change — and a finance person reading two versions of the same audit would notice. The audit's credibility depends entirely on consistency and traceability. A rule that states "Claude Team with fewer than 5 seats → downgrade to Pro, saves ($30 - $20) × seats = $X/mo" is auditable. A language model saying "you should consider optimizing your Claude usage" is not.

I also considered a hybrid — hardcoded math, but AI-generated explanations for each recommendation. I rejected this too: it adds latency per tool and the templated reasons I wrote are already specific and readable. The AI is genuinely better only at the *holistic* narrative paragraph where tone and personalization matter more than precision.

Lesson: AI is not always the right tool for structured, numerical reasoning tasks in a product. Knowing when to use it is as important as knowing how.

---

## 3. What I'd Build in Week 2

**Priority 1 — Supabase persistence (Day 8).** The current in-memory Map loses all audit results on every server restart. Vercel's serverless functions cold-start frequently. One afternoon of work swaps the Map for a Supabase table. The interface in `app/api/audit/route.ts` is already abstracted for this swap — it's a one-function change. Without this, the shareable URL feature is unreliable in production.

**Priority 2 — PDF export (Days 9–10).** The results page is already being screenshotted and shared — I can see this from how the page is designed. A "Download PDF" button using `@react-pdf/renderer` or a headless Chrome screenshot via Puppeteer makes the audit submittable to a CFO or board as a formal document. This also gives Credex a co-branded artifact that travels.

**Priority 3 — Benchmark mode (Days 11–12).** "Your AI spend per developer is $X/mo — the median for companies your size is $Y/mo." This requires collecting enough audits to build real percentile data. Even 100 audits gives usable p25/p50/p75 numbers per team-size bracket. This feature transforms SpendLens from a one-time tool into a benchmarking database, and benchmarks are inherently shareable ("we're in the top quartile for AI spend efficiency").

**Priority 4 — Embeddable widget (Days 13–14).** A `<script>` tag that engineering bloggers and Substack writers can drop into posts: "What's your team's AI spend? Check here ↓ [inline widget]." The viral loop for a B2B lead-gen tool at this stage is content distribution plus embed, not social sharing. One engineering newsletter with 10k subscribers embedding the widget is worth more than 100 tweets.

**Stretch — Referral codes.** Users who share their audit link and result in a successful lead for Credex get a discount on their own credit purchase. Aligns incentives and adds a measurable viral coefficient.

---

## 4. How I Used AI Tools

**Claude (claude.ai):** My primary tool throughout the week. Used it for:
- Drafting and iterating on the entrepreneurial files (GTM, ECONOMICS, LANDING_COPY)
- Checking unit economics math — gave it my assumptions and asked it to find errors in the reasoning
- Reviewing the audit engine rules for logical gaps ("what edge cases am I missing for this tool?")
- Improving prose in REFLECTION.md and the DEVLOG entries

**What I didn't trust AI with:**
- Pricing data — every number was manually verified against the official vendor pricing page. AI training data is stale (often 6–12 months behind), and vendor pricing changes frequently. One wrong number propagates to every audit.
- The audit engine logic itself — AI-generated savings logic would be inconsistent and difficult to audit
- Git commits — I wrote every commit message myself so the history reflects real decision points

**One specific time the AI was wrong:**
I asked Claude to confirm the current Cursor Business plan price and it responded confidently: "$35/user/month." The correct price as of May 2026 is $40/user/month, per cursor.com/pricing. I caught this during the manual verification step I had built into my pricing data process. If I had trusted the AI output without checking, the audit engine would have underestimated Cursor Business savings by $5/seat on every audit — which for a 10-person team is a $50/mo error, and $600/year. This is exactly why PRICING_DATA.md exists as a separate, human-verified file with source URLs and verification dates.

**GitHub Copilot:** Used for boilerplate scaffolding in VS Code — generating TypeScript interface skeletons, Next.js API route templates. Fast for repetitive structure; not used for any logic-bearing code.

---

## 5. Self-Ratings

| Dimension | Rating | Reason |
|-----------|--------|--------|
| Discipline | 7/10 | Work was spread across all 7 days as required, though Day 5 felt rushed — I should have started the tests two days earlier instead of leaving them to the documentation phase. The DEVLOG entries reflect honest daily progress rather than backdated summaries. |
| Code quality | 8/10 | TypeScript throughout with clean interfaces, well-named functions, and clear separation between the audit engine, API layer, and UI. The main weakness is inline styles throughout the React components — a deliberate speed tradeoff, but it would make the codebase harder to maintain at scale. |
| Design sense | 7/10 | The dark theme with the green accent color works well for a developer-facing tool and creates a distinctive visual identity. The savings hero card on the results page is shareable. Mobile responsiveness could be tighter — the 4-column stats grid breaks awkwardly on narrow screens. |
| Problem-solving | 8/10 | Diagnosed and fixed the Zustand hydration bug systematically by forming and testing hypotheses in order. The audit engine handles team-size, use-case, redundancy, and credits-opportunity cases across 8 tools with specific numerical reasoning. |
| Entrepreneurial thinking | 8/10 | GTM identifies specific distribution channels with concrete user counts, not generic "post on Twitter." The ECONOMICS.md has actual math — funnel conversion rates, LTV:CAC, and what has to be true for $1M ARR. The user interviews revealed a real design insight (the running spend counter) that changed the product. |
