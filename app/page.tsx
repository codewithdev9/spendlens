"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store";
import { TOOLS } from "@/lib/pricing-data";
import { ToolId, UseCase } from "@/lib/types";

const USE_CASES: { value: UseCase; label: string; icon: string }[] = [
  { value: "coding", label: "Coding", icon: "⌨️" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "data", label: "Data", icon: "📊" },
  { value: "research", label: "Research", icon: "🔬" },
  { value: "mixed", label: "Mixed", icon: "🔀" },
];

export default function HomePage() {
  const router = useRouter();
  const { formData, addTool, removeTool, updateTool, setTeamSize, setUseCase } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"hero" | "form">("hero");

  const totalSpend = formData.tools.reduce((s, t) => s + t.monthlySpend, 0);

  async function handleSubmit() {
    if (formData.tools.length === 0) { setError("Add at least one tool."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/audit/${data.auditResult.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error. Try again.");
      setLoading(false);
    }
  }

  if (view === "hero") return <Hero onStart={() => setView("form")} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setView("hero")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#000" }}>$</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em" }}>SpendLens</span>
          </button>
          {formData.tools.length > 0 && (
            <span style={{ fontSize: 14, color: "var(--accent)", fontWeight: 700 }}>${totalSpend.toLocaleString()}/mo auditing</span>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.03em" }}>Configure your AI stack</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>Add every AI tool your team pays for. State persists across reloads.</p>

        {/* Team context */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Team context</h2>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, alignItems: "start" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Team size</label>
              <input type="number" min={1} max={50000} value={formData.teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "10px 14px", width: "100%", fontSize: 14, outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Primary use case</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {USE_CASES.map((uc) => (
                  <button key={uc.value} onClick={() => setUseCase(uc.value)}
                    style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${formData.useCase === uc.value ? "var(--accent)" : "var(--border)"}`, background: formData.useCase === uc.value ? "rgba(0,212,170,0.12)" : "var(--surface-2)", color: formData.useCase === uc.value ? "var(--accent)" : "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                    {uc.icon} {uc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tools grid */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Your AI tools</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Add every tool your team pays for.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {TOOLS.map((tool) => {
              const entry = formData.tools.find((t) => t.toolId === tool.id);
              return (
                <ToolCard key={tool.id} tool={tool} entry={entry}
                  onAdd={() => addTool({ toolId: tool.id as ToolId, plan: tool.plans[0].id, monthlySpend: tool.plans[0].pricePerSeatPerMonth > 0 ? tool.plans[0].pricePerSeatPerMonth * Math.min(formData.teamSize, 5) : 200, seats: Math.min(formData.teamSize, 5) })}
                  onRemove={() => removeTool(tool.id)}
                  onUpdate={(u) => updateTool(tool.id, u)} />
              );
            })}
          </div>
        </div>

        {/* Submit */}
        {formData.tools.length > 0 && (
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border-bright)", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 2 }}>{formData.tools.length} tool{formData.tools.length > 1 ? "s" : ""} · {formData.teamSize} people · {formData.useCase}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.03em" }}>${totalSpend.toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)" }}>/mo</span></div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: "var(--text-muted)" }}>
                ${(totalSpend * 12).toLocaleString()}/year
              </div>
            </div>
            {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(255,79,106,0.1)", borderRadius: 8 }}>{error}</div>}
            <button onClick={handleSubmit} aria-label="Run AI spend audit" disabled={loading}
              style={{ background: loading ? "var(--border)" : "var(--accent)", color: loading ? "var(--text-muted)" : "#000", border: "none", borderRadius: 10, padding: "15px 0", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", width: "100%", letterSpacing: "-0.01em", transition: "all 0.2s" }}>
              {loading ? "⚡ Running audit..." : "Run my free audit →"}
            </button>
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>No email required to see results. Takes ~2 seconds.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ToolCard({ tool, entry, onAdd, onRemove, onUpdate }: {
  tool: typeof TOOLS[0];
  entry?: { plan: string; monthlySpend: number; seats: number };
  onAdd: () => void; onRemove: () => void;
  onUpdate: (u: Partial<{ plan: string; monthlySpend: number; seats: number }>) => void;
}) {
  const catColor: Record<string, string> = { ide: "#7c6af5", chat: "#00d4aa", api: "#ffaa00", coding: "#ff6b6b" };
  const color = catColor[tool.category] ?? "#888";
  const isAdded = !!entry;

  return (
    <div style={{ background: isAdded ? "var(--surface-2)" : "var(--surface)", border: `1px solid ${isAdded ? color + "50" : "var(--border)"}`, borderRadius: 10, padding: 16, transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isAdded ? 12 : 0 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{tool.name}</div>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: color + "25", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{tool.category}</span>
        </div>
        <button onClick={isAdded ? onRemove : onAdd}
          style={{ background: isAdded ? "rgba(255,79,106,0.12)" : "rgba(0,212,170,0.12)", color: isAdded ? "var(--danger)" : "var(--accent)", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {isAdded ? "✕" : "+ Add"}
        </button>
      </div>
      {isAdded && entry && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>PLAN</label>
            <select value={entry.plan} onChange={(e) => onUpdate({ plan: e.target.value })}
              style={{ background: "var(--surface-3, #22222f)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: "7px 10px", width: "100%", fontSize: 13, outline: "none" }}>
              {tool.plans.map((p) => <option key={p.id} value={p.id}>{p.name}{p.pricePerSeatPerMonth > 0 ? ` — $${p.pricePerSeatPerMonth}/seat` : " (usage-based)"}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>SEATS</label>
              <input type="number" min={1} value={entry.seats} onChange={(e) => onUpdate({ seats: Number(e.target.value) })}
                style={{ background: "var(--surface-3, #22222f)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: "7px 10px", width: "100%", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>$/MO ACTUAL</label>
              <input type="number" min={0} value={entry.monthlySpend} onChange={(e) => onUpdate({ monthlySpend: Number(e.target.value) })}
                style={{ background: "var(--surface-3, #22222f)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: "7px 10px", width: "100%", fontSize: 13, outline: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 900, height: 900, background: "radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div className="grid-bg" style={{ position: "fixed", inset: 0, opacity: 0.35, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#000" }}>$</div>
              <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em" }}>SpendLens</span>
              <span style={{ fontSize: 11, background: "rgba(0,212,170,0.12)", color: "var(--accent)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 4, padding: "2px 8px", fontWeight: 700, letterSpacing: "0.03em" }}>BY CREDEX</span>
            </div>
            <button onClick={onStart} style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 8, padding: "9px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Start Free Audit →
            </button>
          </div>
        </nav>

        <section style={{ maxWidth: 860, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "var(--text-muted)", marginBottom: 36, fontWeight: 500 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            Free · No login · Results in 2 seconds
          </div>
          <h1 style={{ fontSize: "clamp(44px, 7.5vw, 82px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.045em", marginBottom: 28 }}>
            Stop overpaying<br />for <span className="shimmer-text">AI tools</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 2.2vw, 20px)", color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 52px", lineHeight: 1.65 }}>
            Most startups waste <strong style={{ color: "var(--text)" }}>$200–800/month</strong> on mismatched AI subscriptions. SpendLens audits your stack in 2 minutes and shows you exactly where to cut — free.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onStart} aria-label="Start free AI spend audit" style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 12, padding: "17px 44px", fontSize: 17, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em", boxShadow: "0 8px 48px rgba(0,212,170,0.28)" }}>
              Audit my AI spend — it&apos;s free →
            </button>
            <a href="#how" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 12, padding: "17px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>How it works ↓</a>
          </div>
        </section>

        <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
            {[["$340", "avg monthly savings"], ["2 min", "to complete"], ["8 tools", "in database"], ["100%", "free forever"]].map(([v, l], i) => (
              <div key={i} style={{ padding: "28px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.03em" }}>{v}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <section id="how" style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 52, letterSpacing: "-0.03em" }}>How SpendLens works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { n: "01", t: "Enter your stack", d: "Which AI tools, which plan, how many seats, actual monthly bill. 2 minutes max." },
              { n: "02", t: "Instant audit", d: "Engine checks against official pricing, finds plan mismatches, tool redundancy, and credits opportunities." },
              { n: "03", t: "Act on savings", d: "See exactly what to change. High-savings users get connected to Credex for discounted credits." },
            ].map((item) => (
              <div key={item.n} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--accent)", fontWeight: 700, marginBottom: 14, letterSpacing: "0.05em" }}>{item.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.02em" }}>{item.t}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 100px", textAlign: "center" }}>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 16 }}>Ready to find your savings?</h2>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 40, lineHeight: 1.7 }}>No email required upfront. You see your results first, then decide if you want to save the report.</p>
          <button onClick={onStart} aria-label="Start free AI spend audit" style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 12, padding: "18px 52px", fontSize: 18, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.02em", boxShadow: "0 8px 48px rgba(0,212,170,0.25)" }}>
            Audit my AI spend →
          </button>
        </section>

        <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>SpendLens by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Credex</a> · Pricing verified May 2026 · Not financial advice</p>
        </footer>
      </div>
    </div>
  );
}
