export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number; // user-entered actual spend
  seats: number;
}

export interface AuditFormData {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface Recommendation {
  type: "downgrade" | "switch" | "optimize" | "credits" | "optimal";
  action: string;
  reason: string;
  monthlySavings: number;
}

export interface ToolAuditResult {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  seats: number;
  recommendation: Recommendation;
  officialPlanCost: number; // what they should be paying per pricing data
}

export interface AuditResult {
  id: string;
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  formData: AuditFormData;
  createdAt: string;
  isOptimal: boolean;
}

export interface LeadCaptureData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  monthlySavings: number;
}
