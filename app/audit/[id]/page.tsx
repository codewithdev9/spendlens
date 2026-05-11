"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AuditResult } from "@/lib/types";

export default function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/audit?id=${id}`);
        const data = await res.json();
        if (res.ok) {
          setAudit(data.auditResult);
          fetchSummary(data.auditResult);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function fetchSummary(auditData: AuditResult) {
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit: auditData }),
      });
      const data = await res.json();
      setSummary(data.summary ?? "");
    } catch {
      setSummary("");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audit || !email) return;
    setLeadLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          honeypot,
          lead: { email, companyName: company, role, auditId: audit.id, monthlySavings: audit.totalMonthlySavings, teamSize: audit.formData.teamSize },
        }),
      });
      setLeadSubmitted(true);
    } finally {
      setLeadLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Audit not found</h1>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>← Run a new audit</Link>
      </div>
    );
  }

  const highSavings = audit.totalMonthlySavings > 500;
  const noSavings = audit.isOptimal;
  const totalCurrentSpend = audit.formData.tools.reduce((s, t) => s + t.monthlySpend, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#000" }}>$</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em" }}>SpendLens</span>
          </Link>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={copyLink} aria-label="Copy audit link to clipboard" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {copied ? "✓ Copied!" : "Share report"}
            </button>
            <Link href="/" style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center" }}>
              New audit
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Hero savings card */}
        <div style={{ background: noSavings ? "var(--surface-2)" : "linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(124,106,245,0.08) 100%)", border: `1px solid ${noSavings ? "var(--border)" : "rgba(0,212,170,0.3)"}`, borderRadius: 16, padding: "40px 40px", marginBottom: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
          {!noSavings && (
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          )}
          <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            {noSavings ? "Audit complete — spending efficiently" : "Savings identified"}
          </div>
          {noSavings ? (
            <>
              <div style={{ fontSize: 52, fontWeight: 900, color: "var(--accent-2)", letterSpacing: "-0.04em", marginBottom: 8 }}>✓ Optimized</div>
              <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto" }}>You&apos;re spending well. No significant savings found based on current pricing and usage patterns.</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "clamp(56px, 10vw, 88px)", fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.05em", lineHeight: 1 }}>
                ${audit.totalMonthlySavings.toLocaleString()}<span style={{ fontSize: "0.4em", fontWeight: 500, color: "var(--text-muted)" }}>/mo</span>
              </div>
              <div style={{ fontSize: 18, color: "var(--text-muted)", marginTop: 8, marginBottom: 24 }}>
                <strong style={{ color: "var(--text)" }}>${audit.totalAnnualSavings.toLocaleString()}</strong> annual savings potential
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <div style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 20px", fontSize: 14 }}>
                  <span style={{ color: "var(--text-muted)" }}>Current spend: </span>
                  <strong style={{ color: "var(--danger)" }}>${totalCurrentSpend.toLocaleString()}/mo</strong>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 20px", fontSize: 14 }}>
                  <span style={{ color: "var(--text-muted)" }}>After changes: </span>
                  <strong style={{ color: "var(--accent)" }}>${(totalCurrentSpend - audit.totalMonthlySavings).toLocaleString()}/mo</strong>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 20px", fontSize: 14 }}>
                  <span style={{ color: "var(--text-muted)" }}>Saving: </span>
                  <strong style={{ color: "var(--accent)" }}>{Math.round((audit.totalMonthlySavings / totalCurrentSpend) * 100)}%</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI Summary */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>AI-generated summary</span>
            <span style={{ fontSize: 11, background: "rgba(124,106,245,0.15)", color: "var(--accent-2)", border: "1px solid rgba(124,106,245,0.3)", borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>Claude Haiku</span>
          </div>
          {summaryLoading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, border: "2px solid var(--border)", borderTop: "2px solid var(--accent-2)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Generating personalized summary...
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>{summary || "Summary unavailable."}</p>
          )}
        </div>

        {/* Per-tool breakdown */}
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>Per-tool breakdown</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {audit.toolResults.map((result) => {
            const typeColors: Record<string, string> = {
              downgrade: "#ffaa00",
              switch: "#7c6af5",
              optimize: "#7c6af5",
              credits: "#00d4aa",
              optimal: "#555577",
            };
            const typeLabels: Record<string, string> = {
              downgrade: "Downgrade available",
              switch: "Switch recommended",
              optimize: "Optimize",
              credits: "Credits opportunity",
              optimal: "Already optimal",
            };
            const color = typeColors[result.recommendation.type] ?? "var(--text-muted)";
            const savings = result.recommendation.monthlySavings;

            return (
              <div key={result.toolId} style={{ background: "var(--surface)", border: `1px solid ${savings > 0 ? color + "40" : "var(--border)"}`, borderRadius: 12, padding: 20, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{result.toolName}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {result.currentPlan} · {result.seats} seat{result.seats !== 1 ? "s" : ""} · ${result.currentSpend}/mo actual
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: color + "20", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                      {typeLabels[result.recommendation.type]}
                    </span>
                    {savings > 0 && (
                      <div style={{ fontSize: 20, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.02em" }}>
                        −${savings}/mo
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "var(--text)" }}>{result.recommendation.action}</div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{result.recommendation.reason}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credex CTA for high savings */}
        {highSavings && (
          <div style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(124,106,245,0.1) 100%)", border: "1px solid rgba(0,212,170,0.35)", borderRadius: 16, padding: 32, marginBottom: 28, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>🔥 High savings detected</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>Capture an extra 20–40% with Credex credits</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.7 }}>
              On top of the plan optimizations above, Credex sources discounted AI infrastructure credits from companies that overforecast. With ${audit.totalMonthlySavings}/mo already saved, Credex can push your total savings to <strong style={{ color: "var(--text)" }}>$${Math.round(audit.totalMonthlySavings * 1.35).toLocaleString()}/mo</strong>.
            </p>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
              style={{ background: "var(--accent)", color: "#000", borderRadius: 10, padding: "13px 32px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>
              Book a Credex consultation →
            </a>
          </div>
        )}

        {/* Lead capture */}
        {!leadSubmitted ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              {noSavings ? "Get notified when new optimizations apply to your stack" : "Save & email this report"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
              {noSavings
                ? "AI pricing changes frequently. We'll alert you when a better plan or alternative becomes available for your tools."
                : "Get a copy of this audit delivered to your inbox. High-savings cases will be contacted by a Credex advisor."}
            </p>
            {!showLeadForm ? (
              <button onClick={() => setShowLeadForm(true)} aria-label="Open email capture form"
                style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {noSavings ? "Notify me of new savings →" : "Email me this report →"}
              </button>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                {/* Honeypot */}
                <input tabIndex={-1} aria-hidden="true" style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
                  value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "10px 14px", fontSize: 14, outline: "none" }} />
                  <input type="text" placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "10px 14px", fontSize: 14, outline: "none" }} />
                  <input type="text" placeholder="Your role (optional)" value={role} onChange={(e) => setRole(e.target.value)}
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "10px 14px", fontSize: 14, outline: "none" }} />
                </div>
                <button type="submit" disabled={leadLoading} aria-label="Submit email to receive audit report"
                  style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: leadLoading ? "not-allowed" : "pointer" }}>
                  {leadLoading ? "Sending..." : "Send me the report →"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Report sent to {email}</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {highSavings ? "A Credex advisor will reach out within 1 business day about discounted credits." : "We'll notify you when new optimizations apply to your stack."}
            </p>
          </div>
        )}

        {/* Share */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>Share this audit (identifying info stripped from public URL)</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={copyLink}
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {copied ? "✓ Link copied!" : "Copy audit link"}
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just audited my AI tool spend with SpendLens — found $${audit.totalMonthlySavings}/mo in savings. Free tool by @credex_rocks`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank" rel="noopener noreferrer"
              style={{ background: "#000", color: "#fff", border: "1px solid #333", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Share on 𝕏
            </a>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
