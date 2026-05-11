# Dev Log — SpendLens

## Day 1 — 2026-05-08
### Hours Worked
12 Hours

### Work Completed
- Read the full project brief and mapped the complete application architecture before development.
- Initialized the project using Next.js 15, TypeScript, and Tailwind CSS.
- Built the foundational type system and pricing data layer for all 8 AI tools.
- Verified pricing directly from official vendor sources for accurate audit recommendations.
- Developed the initial audit engine with per-tool evaluation logic.
- Implemented redundancy detection for overlapping subscriptions such as Cursor + Copilot.

### Key Learnings
- AI coding tools may appear similar but differ significantly in pricing structures and workflows.
- Small teams frequently overspend by purchasing unnecessary team plans because of minimum seat requirements.

### Challenges Faced
- Needed to decide between early database integration or a lightweight MVP architecture.
- Chose an in-memory Map-based solution for faster iteration and simpler deployment.

### Outcome
- Completed the core recommendation engine with structured pricing intelligence and cost-saving logic.

---

## Day 2 — 2026-05-09
### Hours Worked
8 Hours

### Work Completed
- Built the complete landing page including hero section, stats ticker, and workflow explanation.
- Developed the interactive multi-tool audit form with Zustand persistence.
- Connected the `/api/audit` route to the frontend workflow.
- Improved ToolCard UX for smoother add, remove, and configure interactions.
- Started building the audit results page with savings breakdowns and AI-generated summaries.
- Added lead capture functionality.

### Key Learnings
- Zustand persistence is effective for lightweight state management.
- Next.js App Router requires careful hydration handling for client-persisted state.
- Deterministic fallback summaries can still feel natural when prompts are constrained correctly.

### Challenges Faced
- Encountered hydration mismatch issues during initial rendering.
- Solved the issue using client-side hydration guards and conditional rendering.

### Outcome
- Completed a functional end-to-end audit flow from form submission to AI-generated analysis.

---

## Day 3 — 2026-05-10
### Hours Worked
8 Hours

### Work Completed
- Integrated Claude Haiku through `/api/summary` for AI-powered summaries.
- Added fallback logic for API failure scenarios.
- Implemented spam-protected lead capture with Resend integration and rate limiting.
- Wrote documentation files:
  - `README.md`
  - `ARCHITECTURE.md`
  - `PRICING_DATA.md`
  - `PROMPTS.md`
- Configured Jest and added automated tests for:
  - Audit logic
  - Redundancy detection
  - Team-size pricing behavior
- Set up GitHub Actions CI pipeline.

### Key Learnings
- Short and focused prompts generate significantly better AI responses.
- Documentation quality directly improves maintainability and product clarity.

### Challenges Faced
- CI pipeline required multiple iterative fixes while tests were still being added.

### Outcome
- Completed backend APIs, automated testing setup, documentation, and CI/CD workflow.

---

## Day 4 — 2026-05-11
### Hours Worked
10 Hours

### Work Completed
- Conducted user interviews through indie hacker communities.
- Collected insights around AI subscription overspending patterns.
- Finalized GTM strategy, metrics planning, and economics documentation.
- Completed Lighthouse optimization and fixed remaining hydration warnings.
- Deployed the application to Vercel.
- Verified all MVP features on the production deployment.
- Finished final reflection and project polish before submission.

### Key Learnings
- Engineers often identify overspending first, but decision-makers control purchasing.
- Shareable audit results are essential for communicating value to finance teams and CTOs.

### Challenges Faced
- Translating user interview insights into practical product decisions within limited time.

### Outcome
- Successfully shipped a production-ready MVP with optimized frontend performance, complete documentation, and validated user feedback.
