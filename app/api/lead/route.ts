import { NextRequest, NextResponse } from "next/server";
import { LeadCaptureData } from "@/lib/types";

// In-memory lead store (replace with Supabase in production)
const leadStore = new Map<string, LeadCaptureData & { capturedAt: string }>();

// Honeypot + basic rate limit state
const emailRateLimit = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead, honeypot } = body as { lead: LeadCaptureData; honeypot?: string };

    // Honeypot check — bots fill hidden fields
    if (honeypot) {
      // Silently accept but don't store
      return NextResponse.json({ success: true });
    }

    // Basic email validation
    if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Rate limit: max 3 captures per email per hour
    const now = Date.now();
    const lastCapture = emailRateLimit.get(lead.email) ?? 0;
    if (now - lastCapture < 3600000 / 3) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    emailRateLimit.set(lead.email, now);

    // Store lead
    const leadRecord = { ...lead, capturedAt: new Date().toISOString() };
    leadStore.set(`${lead.email}:${lead.auditId}`, leadRecord);

    // Send transactional email via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await sendConfirmationEmail(lead, resendKey);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function sendConfirmationEmail(lead: LeadCaptureData, apiKey: string) {
  const isHighSavings = lead.monthlySavings > 500;

  const emailHtml = `
    <h2>Your AI Spend Audit is ready 🎯</h2>
    <p>Hi${lead.role ? ` ${lead.role}` : ""},</p>
    <p>We've analyzed your AI tool stack and identified <strong>$${lead.monthlySavings}/month</strong> in potential savings ($${lead.monthlySavings * 12}/year).</p>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/audit/${lead.auditId}">View your full audit report →</a></p>
    ${
      isHighSavings
        ? `<p><strong>Because your savings potential exceeds $500/month, a Credex advisor will reach out within 1 business day to discuss discounted AI infrastructure credits that can capture an additional 20-40% savings on top of plan optimizations.</strong></p>`
        : ""
    }
    <hr/>
    <p style="color: #666; font-size: 12px;">Credex · credex.rocks · You're receiving this because you ran an AI spend audit.</p>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "audit@credex.rocks",
        to: lead.email,
        subject: `Your AI Spend Audit — $${lead.monthlySavings}/mo in savings identified`,
        html: emailHtml,
      }),
    });
  } catch (err) {
    console.error("Email send failed:", err);
    // Non-fatal — lead is still stored
  }
}
