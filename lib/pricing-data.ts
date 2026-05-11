import { ToolId, UseCase } from "./types";

export interface PlanData {
  id: string;
  name: string;
  pricePerSeatPerMonth: number; // USD
  minSeats?: number;
  maxSeats?: number;
  features: string[];
  bestFor: UseCase[];
  sourceUrl: string;
  verifiedDate: string;
}

export interface ToolData {
  id: ToolId;
  name: string;
  category: "ide" | "chat" | "api" | "coding";
  plans: PlanData[];
  description: string;
}

export const TOOLS: ToolData[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "ide",
    description: "AI-powered code editor",
    plans: [
      {
        id: "hobby",
        name: "Hobby",
        pricePerSeatPerMonth: 0,
        features: ["2000 completions/month", "50 slow premium requests"],
        bestFor: ["coding"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2026-05-09",
      },
      {
        id: "pro",
        name: "Pro",
        pricePerSeatPerMonth: 20,
        features: ["Unlimited completions", "500 fast premium requests/month"],
        bestFor: ["coding"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2026-05-09",
      },
      {
        id: "business",
        name: "Business",
        pricePerSeatPerMonth: 40,
        minSeats: 1,
        features: ["Everything in Pro", "Centralized billing", "Admin dashboard", "Privacy mode enforced"],
        bestFor: ["coding"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2026-05-09",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeatPerMonth: 60,
        minSeats: 20,
        features: ["Custom deployments", "SSO", "Dedicated support"],
        bestFor: ["coding"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "ide",
    description: "AI pair programmer by GitHub/Microsoft",
    plans: [
      {
        id: "individual",
        name: "Individual",
        pricePerSeatPerMonth: 10,
        features: ["Code completions", "Chat in IDE", "CLI assistance"],
        bestFor: ["coding"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: "2026-05-09",
      },
      {
        id: "business",
        name: "Business",
        pricePerSeatPerMonth: 19,
        minSeats: 1,
        features: ["Everything Individual", "Organization policies", "Audit logs"],
        bestFor: ["coding"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: "2026-05-09",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeatPerMonth: 39,
        minSeats: 1,
        features: ["Everything Business", "Custom models", "Knowledge bases", "PR summaries"],
        bestFor: ["coding"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    description: "Anthropic's AI assistant",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeatPerMonth: 0,
        features: ["Limited messages", "Claude 3.5 Haiku access"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2026-05-09",
      },
      {
        id: "pro",
        name: "Pro",
        pricePerSeatPerMonth: 20,
        features: ["5x more usage", "Priority access", "Projects", "Claude Sonnet 4.6"],
        bestFor: ["writing", "research", "coding", "mixed"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2026-05-09",
      },
      {
        id: "max",
        name: "Max",
        pricePerSeatPerMonth: 100,
        features: ["20x more usage than Pro", "Opus access", "Claude Code extended"],
        bestFor: ["coding", "research", "mixed"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2026-05-09",
      },
      {
        id: "team",
        name: "Team",
        pricePerSeatPerMonth: 30,
        minSeats: 5,
        features: ["Higher limits than Pro", "Shared projects", "Admin console"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2026-05-09",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeatPerMonth: 60,
        minSeats: 25,
        features: ["Unlimited usage", "SSO/SAML", "Custom retention", "Dedicated support"],
        bestFor: ["writing", "research", "coding", "mixed"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    description: "OpenAI's ChatGPT assistant",
    plans: [
      {
        id: "plus",
        name: "Plus",
        pricePerSeatPerMonth: 20,
        features: ["GPT-4o access", "DALL-E 3", "Advanced voice mode"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2026-05-09",
      },
      {
        id: "team",
        name: "Team",
        pricePerSeatPerMonth: 30,
        minSeats: 2,
        features: ["Everything Plus", "Admin console", "Higher limits", "Workspace"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2026-05-09",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerSeatPerMonth: 60,
        minSeats: 150,
        features: ["Unlimited GPT-4o", "Advanced security", "SSO", "Custom GPTs at scale"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://openai.com/chatgpt/pricing/",
        verifiedDate: "2026-05-09",
      },
      {
        id: "api",
        name: "API Direct",
        pricePerSeatPerMonth: 0, // usage-based
        features: ["Pay per token", "GPT-4o: $2.50/1M input tokens", "GPT-4o-mini: $0.15/1M input tokens"],
        bestFor: ["coding", "data", "research"],
        sourceUrl: "https://openai.com/api/pricing/",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    description: "Direct Anthropic API access",
    plans: [
      {
        id: "api",
        name: "API (Pay-as-you-go)",
        pricePerSeatPerMonth: 0,
        features: [
          "Claude Sonnet 4.6: $3/1M input, $15/1M output",
          "Claude Haiku 4.5: $0.80/1M input, $4/1M output",
          "Claude Opus 4.6: $15/1M input, $75/1M output",
        ],
        bestFor: ["coding", "data", "research"],
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    description: "Direct OpenAI API access",
    plans: [
      {
        id: "api",
        name: "API (Pay-as-you-go)",
        pricePerSeatPerMonth: 0,
        features: [
          "GPT-4o: $2.50/1M input, $10/1M output",
          "GPT-4o-mini: $0.15/1M input, $0.60/1M output",
          "o3-mini: $1.10/1M input, $4.40/1M output",
        ],
        bestFor: ["coding", "data", "research"],
        sourceUrl: "https://openai.com/api/pricing/",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    description: "Google's Gemini AI assistant",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeatPerMonth: 0,
        features: ["Gemini 1.5 Flash", "Basic features"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://one.google.com/about/plans",
        verifiedDate: "2026-05-09",
      },
      {
        id: "pro",
        name: "Google One AI Premium",
        pricePerSeatPerMonth: 20,
        features: ["Gemini Advanced", "2TB storage", "Gemini in Workspace apps"],
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://one.google.com/about/plans",
        verifiedDate: "2026-05-09",
      },
      {
        id: "api",
        name: "API",
        pricePerSeatPerMonth: 0,
        features: [
          "Gemini 1.5 Pro: $3.50/1M input tokens",
          "Gemini 1.5 Flash: $0.075/1M input tokens",
          "Free tier: 15 RPM",
        ],
        bestFor: ["coding", "data", "research"],
        sourceUrl: "https://ai.google.dev/pricing",
        verifiedDate: "2026-05-09",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "ide",
    description: "AI-powered IDE by Codeium",
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerSeatPerMonth: 0,
        features: ["Unlimited autocomplete", "5 Flow Actions/day", "1000 prompt credits/month"],
        bestFor: ["coding"],
        sourceUrl: "https://codeium.com/windsurf/pricing",
        verifiedDate: "2026-05-09",
      },
      {
        id: "pro",
        name: "Pro",
        pricePerSeatPerMonth: 15,
        features: ["Unlimited autocomplete", "Unlimited Flow Actions", "Priority access"],
        bestFor: ["coding"],
        sourceUrl: "https://codeium.com/windsurf/pricing",
        verifiedDate: "2026-05-09",
      },
      {
        id: "teams",
        name: "Teams",
        pricePerSeatPerMonth: 35,
        minSeats: 5,
        features: ["Everything Pro", "Admin controls", "Usage analytics", "SSO"],
        bestFor: ["coding"],
        sourceUrl: "https://codeium.com/windsurf/pricing",
        verifiedDate: "2026-05-09",
      },
    ],
  },
];

export const getToolById = (id: ToolId): ToolData | undefined =>
  TOOLS.find((t) => t.id === id);

export const getPlanById = (toolId: ToolId, planId: string): PlanData | undefined =>
  getToolById(toolId)?.plans.find((p) => p.id === planId);
