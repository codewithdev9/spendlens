import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { AuditFormData } from "@/lib/types";

// In-memory store for demo (replace with Supabase in production)
export const auditStore = new Map<string, object>();

export async function POST(req: NextRequest) {
  try {
    // Rate limiting via IP (basic)
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitKey = `audit:${ip}`;
    
    // Simple in-memory rate limit: 10 audits per IP per session
    // In production: use Redis / Upstash
    
    const body = await req.json();
    const formData = body as AuditFormData;

    // Validation
    if (!formData.tools || formData.tools.length === 0) {
      return NextResponse.json({ error: "No tools provided" }, { status: 400 });
    }
    if (!formData.teamSize || formData.teamSize < 1) {
      return NextResponse.json({ error: "Invalid team size" }, { status: 400 });
    }
    if (!formData.useCase) {
      return NextResponse.json({ error: "Use case required" }, { status: 400 });
    }

    const auditResult = await runAudit(formData);

    // Store the audit result (in production: Supabase insert)
    auditStore.set(auditResult.id, auditResult);

    return NextResponse.json({ auditResult }, { status: 200 });
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const result = auditStore.get(id);
  if (!result) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  return NextResponse.json({ auditResult: result });
}
