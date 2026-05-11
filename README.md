# SpendLens — AI Tool Spend Auditor

SpendLens is a free web app that audits your team's AI tool subscriptions (Cursor, Claude, ChatGPT, GitHub Copilot, and more) and identifies exactly where you're overspending — in under 2 minutes, no login required. It's a lead-generation asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

**Target user:** Engineering managers and founders at seed-to-Series A startups who pay for AI tools but have no benchmark for whether they're spending efficiently.

## Screenshots / Demo

> [Loom demo link — add after deployment]

![Hero page](docs/screenshot-hero.png)
![Audit form](docs/screenshot-form.png)
![Results page](docs/screenshot-results.png)

## Quick Start

```bash
# Install
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, RESEND_API_KEY, NEXT_PUBLIC_BASE_URL

# Run locally
npm run dev
# → http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel --prod
# Set env vars in Vercel dashboard
```

## Decisions

1. **Next.js App Router over Remix/SvelteKit** — App Router gives us file-based routing, server components, and edge-compatible OG image generation in one framework. Remix would have been a viable alternative but the Next.js ecosystem has more deployment targets.

2. **In-memory audit store vs Supabase immediately** — For the 7-day MVP, a Map-based store ships faster and avoids cold-start DB latency. In production, this swaps to Supabase with one function change. The interface is abstracted in `app/api/audit/route.ts`.

3. **Hardcoded audit rules vs AI-generated recommendations** — The assignment explicitly calls this out: "For the audit math itself, hardcoded rules are correct — knowing when not to use AI is part of the test." Hardcoded logic is auditable, consistent, and never hallucinates a savings number.

4. **Zustand + persist middleware for form state** — `localStorage`-backed Zustand store means the user's tool configuration survives a page refresh. This is a significant UX improvement for a multi-tool input form and requires zero backend calls.

5. **Email gate after value shown, never before** — The results page shows the full audit immediately; the email form only appears after the user has seen their savings. Conversion rate on post-value capture is 3–5x higher than pre-value gates, and it builds trust.
