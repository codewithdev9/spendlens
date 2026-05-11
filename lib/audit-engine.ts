import { AuditFormData, AuditResult, Recommendation, ToolAuditResult } from "./types";
import { getToolById, getPlanById } from "./pricing-data";
import { nanoid } from "nanoid";

/**
 * AUDIT ENGINE
 * Logic for each tool evaluation:
 * 1. Is the user overpaying vs the official plan price? (billing error / not on right tier)
 * 2. Is there a cheaper same-vendor plan that fits their usage?
 * 3. Is there a substantially cheaper alternative?
 * 4. Are they paying retail when credits could save them money?
 *
 * All savings numbers are defensible vs official pricing pages.
 */

function evaluateTool(
  toolId: string,
  plan: string,
  monthlySpend: number,
  seats: number,
  teamSize: number,
  useCase: string
): { recommendation: Recommendation; officialPlanCost: number } {
  const tool = getToolById(toolId as never);
  if (!tool) {
    return {
      recommendation: { type: "optimal", action: "No data", reason: "Tool not found in database", monthlySavings: 0 },
      officialPlanCost: monthlySpend,
    };
  }

  const planData = getPlanById(toolId as never, plan);
  const officialPlanCost = planData ? planData.pricePerSeatPerMonth * seats : monthlySpend;

  // --- CURSOR ---
  if (toolId === "cursor") {
    if (plan === "business" && seats <= 3 && teamSize <= 3) {
      const proTotal = 20 * seats;
      const savings = officialPlanCost - proTotal;
      if (savings > 0) {
        return {
          recommendation: {
            type: "downgrade",
            action: `Downgrade from Cursor Business ($40/seat) to Cursor Pro ($20/seat)`,
            reason: `With ${seats} developer(s), you don't need Business-tier features (centralized billing, admin dashboard, enforced privacy mode). Cursor Pro gives the same AI capabilities at $20/seat — saving $${savings}/mo with no productivity loss.`,
            monthlySavings: savings,
          },
          officialPlanCost,
        };
      }
    }
    if (plan === "enterprise" && seats < 20) {
      const businessTotal = 40 * seats;
      const savings = officialPlanCost - businessTotal;
      return {
        recommendation: {
          type: "downgrade",
          action: `Downgrade from Cursor Enterprise to Cursor Business`,
          reason: `Cursor Enterprise requires a minimum of 20 seats and is designed for large orgs needing custom deployments. At ${seats} seats, Cursor Business covers your admin + billing needs at $40/seat — saving $${savings}/mo.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    if (useCase !== "coding" && useCase !== "mixed") {
      const savings = officialPlanCost;
      return {
        recommendation: {
          type: "switch",
          action: `Consider removing Cursor for ${useCase} use cases`,
          reason: `Cursor is an IDE coding assistant — not optimized for ${useCase}. For a ${useCase}-focused team, Claude Pro ($20/seat) or ChatGPT Plus ($20/seat) deliver better ROI. Eliminating Cursor could save $${savings}/mo.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    // Check if paying over retail — credits opportunity
    if (monthlySpend > officialPlanCost * 1.05) {
      const savings = monthlySpend - officialPlanCost;
      return {
        recommendation: {
          type: "optimize",
          action: "You may be paying above list price — verify your billing",
          reason: `Official Cursor ${plan} pricing is $${officialPlanCost}/mo for ${seats} seat(s). You reported $${monthlySpend}/mo — a $${savings.toFixed(0)} discrepancy. Check for unused seats or outdated contract pricing.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    return {
      recommendation: {
        type: "optimal",
        action: "Cursor spend looks right for your coding team",
        reason: `Cursor Pro/Business at $${officialPlanCost}/mo for ${seats} developer(s) is the standard rate. No immediate optimization available, but Credex discounted credits can reduce this cost if available.`,
        monthlySavings: 0,
      },
      officialPlanCost,
    };
  }

  // --- GITHUB COPILOT ---
  if (toolId === "github_copilot") {
    if (plan === "enterprise" && teamSize < 50) {
      const businessTotal = 19 * seats;
      const savings = officialPlanCost - businessTotal;
      if (savings > 0) {
        return {
          recommendation: {
            type: "downgrade",
            action: `Downgrade from Copilot Enterprise ($39/seat) to Business ($19/seat)`,
            reason: `Copilot Enterprise adds fine-tuned org models and Bing-powered PR summaries — features that matter at 50+ devs. With ${teamSize} team members, Business tier covers policy management and audit logs at nearly half the price, saving $${savings}/mo.`,
            monthlySavings: savings,
          },
          officialPlanCost,
        };
      }
    }
    if (plan === "individual" && seats >= 5) {
      const businessTotal = 19 * seats;
      const savings = officialPlanCost - businessTotal;
      // Business is more expensive, but org benefits kick in
      if (officialPlanCost > businessTotal) {
        return {
          recommendation: {
            type: "optimize",
            action: "Consolidate to Copilot Business for org controls",
            reason: `${seats} Individual licenses cost $${officialPlanCost}/mo. Copilot Business at $19/seat ($${businessTotal}/mo) adds centralized policy, seat management, and audit logs — and costs more. But for ${seats}+ users, the admin overhead of individual billing often costs more in hidden ops time.`,
            monthlySavings: 0,
          },
          officialPlanCost,
        };
      }
    }
    // Compare vs Cursor Pro for pure coding teams
    if (useCase === "coding" && seats >= 3) {
      const cursorProTotal = 20 * seats;
      const savings = officialPlanCost - cursorProTotal;
      if (savings >= 30) {
        return {
          recommendation: {
            type: "switch",
            action: `Consider switching to Cursor Pro ($20/seat) for dedicated coding teams`,
            reason: `Cursor's editor-native AI (Tab autocomplete, Composer, Agent mode) is widely rated higher for active coding workflows than Copilot's IDE plugin model. At ${seats} seats: Cursor Pro = $${cursorProTotal}/mo vs Copilot ${plan} = $${officialPlanCost}/mo — potential $${savings}/mo saving.`,
            monthlySavings: savings,
          },
          officialPlanCost,
        };
      }
    }
    return {
      recommendation: {
        type: "optimal",
        action: "GitHub Copilot spend is reasonable for your team",
        reason: `Copilot ${plan} at $${officialPlanCost}/mo for ${seats} seat(s) aligns with standard pricing. Consider Credex if discounted licenses become available.`,
        monthlySavings: 0,
      },
      officialPlanCost,
    };
  }

  // --- CLAUDE ---
  if (toolId === "claude") {
    if (plan === "team" && seats < 5) {
      const proTotal = 20 * seats;
      const teamTotal = 30 * seats;
      const savings = teamTotal - proTotal;
      return {
        recommendation: {
          type: "downgrade",
          action: `Downgrade from Claude Team ($30/seat) to Pro ($20/seat)`,
          reason: `Claude Team requires 5-seat minimum billing and adds shared Projects + admin console. With ${seats} seats, the shared workspace benefits are limited and Pro delivers the same model access at $20/seat — saving $${savings}/mo.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    if (plan === "max" && useCase === "writing") {
      const proSavings = 100 - 20;
      return {
        recommendation: {
          type: "downgrade",
          action: `Downgrade from Claude Max ($100/seat) to Pro ($20/seat) for writing use cases`,
          reason: `Claude Max's 20x higher limits are designed for power users doing extended coding/research sessions. For writing workflows, Claude Pro's limits ($20/seat) are rarely hit in practice — saving $${proSavings * seats}/mo across ${seats} seat(s).`,
          monthlySavings: proSavings * seats,
        },
        officialPlanCost,
      };
    }
    if (plan === "enterprise" && seats < 25) {
      const teamTotal = 30 * seats;
      const savings = officialPlanCost - teamTotal;
      return {
        recommendation: {
          type: "downgrade",
          action: `Downgrade from Claude Enterprise to Team — you're below the 25-seat threshold`,
          reason: `Enterprise adds SSO/SAML, custom data retention, and dedicated support. For ${seats} seats, these controls are premature and Team plan covers shared Projects at $30/seat, saving $${savings}/mo.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    return {
      recommendation: {
        type: "optimal",
        action: "Claude plan is appropriate for your usage",
        reason: `Claude ${plan} at $${officialPlanCost}/mo is correctly sized for a ${seats}-seat team focused on ${useCase}.`,
        monthlySavings: 0,
      },
      officialPlanCost,
    };
  }

  // --- CHATGPT ---
  if (toolId === "chatgpt") {
    if (plan === "team" && seats < 5) {
      const plusTotal = 20 * seats;
      const teamTotal = 30 * seats;
      const savings = teamTotal - plusTotal;
      return {
        recommendation: {
          type: "downgrade",
          action: `Downgrade from ChatGPT Team ($30/seat) to Plus ($20/seat)`,
          reason: `ChatGPT Team is priced at $30/seat but primarily adds workspace + admin controls. For ${seats} seats, the collaboration overhead doesn't justify the premium. ChatGPT Plus gives the same GPT-4o access at $20/seat — saving $${savings}/mo.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    if (plan === "enterprise" && seats < 150) {
      const teamTotal = 30 * seats;
      const savings = officialPlanCost - teamTotal;
      if (savings > 0) {
        return {
          recommendation: {
            type: "downgrade",
            action: `ChatGPT Enterprise is priced for 150+ user deployments`,
            reason: `Enterprise tier requires minimum 150-seat commitment and annual contract. At ${seats} seats, ChatGPT Team ($30/seat) gives comparable features including higher limits and workspace — saving ~$${savings}/mo at contract expiry.`,
            monthlySavings: savings,
          },
          officialPlanCost,
        };
      }
    }
    // ChatGPT + Claude overlap
    return {
      recommendation: {
        type: "optimal",
        action: "ChatGPT spend is aligned with standard pricing",
        reason: `ChatGPT ${plan} at $${officialPlanCost}/mo covers your ${useCase} use case adequately.`,
        monthlySavings: 0,
      },
      officialPlanCost,
    };
  }

  // --- ANTHROPIC API + OPENAI API (usage-based) ---
  if (toolId === "anthropic_api" || toolId === "openai_api") {
    if (monthlySpend > 500) {
      return {
        recommendation: {
          type: "credits",
          action: `High API spend ($${monthlySpend}/mo) — Credex discounted credits apply here`,
          reason: `At $${monthlySpend}/mo on ${toolId === "anthropic_api" ? "Anthropic" : "OpenAI"} API, you're spending $${monthlySpend * 12}/yr at retail. Credex sources discounted credits from companies that overforecast — typical discount is 20-40%. Potential annual saving: $${Math.round(monthlySpend * 12 * 0.3)}.`,
          monthlySavings: Math.round(monthlySpend * 0.3),
        },
        officialPlanCost: monthlySpend,
      };
    }
    if (monthlySpend > 200) {
      // Suggest model downtier — use cheaper models for suitable tasks
      const downtieredSavings = Math.round(monthlySpend * 0.35);
      return {
        recommendation: {
          type: "optimize",
          action: `Route suitable tasks to cheaper models within ${toolId === "anthropic_api" ? "Claude Haiku" : "GPT-4o-mini"}`,
          reason: `At $${monthlySpend}/mo, auditing your model usage mix can yield significant savings. ${toolId === "anthropic_api" ? "Claude Haiku 4.5 ($0.80/1M input tokens) vs Sonnet ($3/1M) is a 73% cost reduction for classification, extraction, and short-form tasks." : "GPT-4o-mini ($0.15/1M input) vs GPT-4o ($2.50/1M) is an 94% reduction for suitable tasks."} Estimated 30-35% total bill reduction: ~$${downtieredSavings}/mo.`,
          monthlySavings: downtieredSavings,
        },
        officialPlanCost: monthlySpend,
      };
    }
    return {
      recommendation: {
        type: "optimal",
        action: "API spend is modest — usage-based billing is already efficient at this scale",
        reason: `$${monthlySpend}/mo on ${toolId === "anthropic_api" ? "Anthropic" : "OpenAI"} API is reasonable. Review model selection if usage grows. Set billing alerts at $${Math.round(monthlySpend * 1.5)} to catch unexpected spikes.`,
        monthlySavings: 0,
      },
      officialPlanCost: monthlySpend,
    };
  }

  // --- GEMINI ---
  if (toolId === "gemini") {
    if (plan === "pro" && useCase === "coding") {
      const savings = 20 * seats;
      return {
        recommendation: {
          type: "switch",
          action: `For coding workflows, Cursor Pro ($20/seat) outperforms Gemini Advanced`,
          reason: `Gemini Advanced (Google One AI Premium, $20/seat) lacks deep IDE integration and code-execution features. For a ${seats}-person coding team, Cursor Pro at the same price delivers editor-native AI with Tab autocomplete, Agent mode, and multi-file edits — saving $0 but dramatically improving developer productivity.`,
          monthlySavings: 0,
        },
        officialPlanCost,
      };
    }
    return {
      recommendation: {
        type: "optimal",
        action: "Gemini spend is reasonable",
        reason: `Gemini ${plan} at $${officialPlanCost}/mo is standard pricing for your ${useCase} use case.`,
        monthlySavings: 0,
      },
      officialPlanCost,
    };
  }

  // --- WINDSURF ---
  if (toolId === "windsurf") {
    if (plan === "teams" && seats < 5) {
      const proTotal = 15 * seats;
      const teamsTotal = 35 * seats;
      const savings = teamsTotal - proTotal;
      return {
        recommendation: {
          type: "downgrade",
          action: `Downgrade from Windsurf Teams ($35/seat) to Pro ($15/seat)`,
          reason: `Windsurf Teams requires 5-seat minimum and adds admin controls + SSO. With ${seats} developers, Windsurf Pro at $15/seat gives unlimited autocomplete and Flow Actions — saving $${savings}/mo.`,
          monthlySavings: savings,
        },
        officialPlanCost,
      };
    }
    return {
      recommendation: {
        type: "optimal",
        action: "Windsurf spend looks appropriate",
        reason: `Windsurf ${plan} at $${officialPlanCost}/mo is correctly sized for ${seats} developer(s).`,
        monthlySavings: 0,
      },
      officialPlanCost,
    };
  }

  return {
    recommendation: {
      type: "optimal",
      action: "Spend appears reasonable",
      reason: "No optimization identified based on current pricing data.",
      monthlySavings: 0,
    },
    officialPlanCost,
  };
}

// Check for tool overlap / redundancy
function checkRedundancy(
  tools: Array<{ toolId: string; plan: string; seats: number; monthlySpend: number }>,
  useCase: string
): Array<{ toolId: string; monthlySavings: number; reason: string }> {
  const redundancies: Array<{ toolId: string; monthlySavings: number; reason: string }> = [];

  const hasCursor = tools.find((t) => t.toolId === "cursor");
  const hasCopilot = tools.find((t) => t.toolId === "github_copilot");
  const hasWindsurf = tools.find((t) => t.toolId === "windsurf");

  // Running 2+ IDE coding assistants is almost always redundant
  const ideTools = [hasCursor, hasCopilot, hasWindsurf].filter(Boolean);
  if (ideTools.length >= 2 && hasCursor && hasCopilot) {
    const copilotSpend = hasCopilot.monthlySpend;
    redundancies.push({
      toolId: "github_copilot",
      monthlySavings: copilotSpend,
      reason: `You're running Cursor and GitHub Copilot simultaneously — both provide in-editor AI code completions. Most teams pick one. Cursor's deeper editor integration (Composer, Agent, multi-file edits) typically wins for greenfield development. Dropping Copilot saves $${copilotSpend}/mo.`,
    });
  }

  const hasClaude = tools.find((t) => t.toolId === "claude");
  const hasChatGPT = tools.find((t) => t.toolId === "chatgpt");

  if (hasClaude && hasChatGPT && useCase !== "mixed" && useCase !== "research") {
    const chatgptSpend = hasChatGPT.monthlySpend;
    redundancies.push({
      toolId: "chatgpt",
      monthlySavings: chatgptSpend,
      reason: `Running Claude and ChatGPT for ${useCase} workflows creates $${chatgptSpend + hasClaude.monthlySpend}/mo in overlapping spend. For ${useCase}, Claude's strengths (long context, writing quality) typically win. Consolidating to one LLM saves $${chatgptSpend}/mo.`,
    });
  }

  return redundancies;
}

export async function runAudit(formData: AuditFormData): Promise<AuditResult> {
  const { tools, teamSize, useCase } = formData;

  const toolResults: ToolAuditResult[] = tools.map((entry) => {
    const tool = getToolById(entry.toolId);
    const { recommendation, officialPlanCost } = evaluateTool(
      entry.toolId,
      entry.plan,
      entry.monthlySpend,
      entry.seats,
      teamSize,
      useCase
    );
    return {
      toolId: entry.toolId,
      toolName: tool?.name ?? entry.toolId,
      currentPlan: entry.plan,
      currentSpend: entry.monthlySpend,
      seats: entry.seats,
      recommendation,
      officialPlanCost,
    };
  });

  // Apply redundancy checks and merge savings
  const redundancies = checkRedundancy(tools, useCase);
  for (const red of redundancies) {
    const existing = toolResults.find((r) => r.toolId === red.toolId);
    if (existing && existing.recommendation.monthlySavings < red.monthlySavings) {
      existing.recommendation = {
        type: "switch",
        action: "Eliminate redundant tool overlap",
        reason: red.reason,
        monthlySavings: red.monthlySavings,
      };
    }
  }

  const totalMonthlySavings = toolResults.reduce(
    (sum, r) => sum + r.recommendation.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;
  const isOptimal = totalMonthlySavings < 100;

  return {
    id: nanoid(10),
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings,
    aiSummary: "", // filled by API call
    formData,
    createdAt: new Date().toISOString(),
    isOptimal,
  };
}
