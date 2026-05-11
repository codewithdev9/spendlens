# User Interviews

Three conversations with potential users, conducted via DM on X and Indie Hackers Slack during the build week. Each was 10–15 minutes, unstructured, starting with "do you pay for any AI tools for your team?"

---

## Interview 1 — A.K., CTO, 8-person B2B SaaS (pre-Series A)

**What they said:**
- "We have Cursor Business for 6 people, GitHub Copilot Individual for 3 people — I'm not even sure who still uses Copilot."
- "I approved all of these separately, there's no one place where I see the total."
- "I've thought about auditing it but I always deprioritize it. It's probably $800–1000/month but I don't know."

**Most surprising thing:** He didn't know how much his team was spending in total. He approved each subscription individually as Slack DM requests. No one had ever added them up. The number he guessed was $800 — the actual total he calculated during our conversation was $1,040/month.

**What it changed about design:** Added a running "total monthly spend" counter in the form header so it compounds as users add tools. This creates an "oh no" moment before they even run the audit — and primes them to expect savings.

---

## Interview 2 — P.R., Founding Engineer, 4-person agency

**What they said:**
- "We're on Claude Team but there are only 4 of us — I didn't realize there was a minimum seat thing."
- "I'm paying $30/seat × 5 seats = $150/month for 4 people. That's a weird tax."
- "The reason I haven't switched is I don't want to lose the shared Projects feature — but I don't think we actually use shared Projects."
- "I'd want the tool to tell me specifically what I'd lose if I downgraded, not just that I should."

**Most surprising thing:** She was already aware she might be overpaying but hadn't acted because she wasn't sure what she'd lose. The hesitation wasn't about the money — it was about uncertainty.

**What it changed about design:** Each recommendation now includes a one-sentence "reason" that explains specifically *what changes* (not just the savings amount). E.g., "Cursor Pro gives the same AI capabilities — no features lost." Reducing uncertainty in the action step removes the hesitation-to-act barrier.

---

## Interview 3 — J.M., Solo founder / indie hacker

**What they said:**
- "I use Claude Pro and ChatGPT Plus — $40/month total, just me."
- "I'm honestly fine with $40/month, but I keep seeing people say one is better than the other and I wonder if I should consolidate."
- "I tried to build something like this for my own use once. Just a spreadsheet. I never kept it updated."
- "I wouldn't pay for this but I'd definitely use it if it's free."

**Most surprising thing:** He tried to build the same tool himself — a spreadsheet — but gave up because maintenance was too painful. He didn't think of this as a problem worth solving for others because his own spend was low. This is the user who comes in via HN or Twitter, completes the audit quickly, and either says "you're spending efficiently" or identifies a small redundancy. He won't convert to Credex, but his tweet about the tool reaches the right audience.

**What it changed about design:** Made the "you're already spending well" result genuinely positive, not a dead end. Added "notify me when new optimizations apply" as the CTA for low-savings users — it captures the lead and delivers value without being dishonest about the savings.
