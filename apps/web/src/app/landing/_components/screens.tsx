"use client";

import { T } from "./tokens";

// ─── App screen: Dashboard ────────────────────────────────────────────────────
export function ScreenDashboard() {
  const txs = [
    { label: "Monthly Salary", cat: "Income", amt: "+Rp 8.500.000", income: true },
    { label: "Grocery Store", cat: "Food & Drink", amt: "-Rp 185.000", income: false },
    { label: "Netflix", cat: "Subscriptions", amt: "-Rp 54.000", income: false },
    { label: "Coffee Shop", cat: "Food & Drink", amt: "-Rp 42.000", income: false },
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: T.fontText, background: T.canvasParchment }}>
      <div style={{ padding: "40px 18px 14px" }}>
        <div style={{ fontSize: 12, color: T.textMuted }}>June 2026</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: "-0.4px", marginTop: 2 }}>
          Good evening
        </div>
      </div>
      {/* net flow card */}
      <div style={{ margin: "0 14px", background: T.primary, borderRadius: 18, padding: "16px 18px", color: T.onDark }}>
        <div style={{ fontSize: 11, opacity: 0.85 }}>Net flow this month</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", marginTop: 2 }}>Rp 7.419.000</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11 }}>
          <span>↑ Income Rp 10.7jt</span>
          <span>↓ Spend Rp 3.28jt</span>
        </div>
      </div>
      {/* list */}
      <div style={{ margin: "16px 14px 0", background: T.canvas, borderRadius: 18, padding: "6px 14px", flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, padding: "10px 0 6px" }}>Recent</div>
        {txs.map((t, i) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 0",
              borderTop: i === 0 ? "none" : "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: t.income ? T.incomeSoft : T.expenseSoft,
                  color: t.income ? T.income : T.expense,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                {t.income ? "↑" : "↓"}
              </span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{t.label}</div>
                <div style={{ fontSize: 10.5, color: T.textMuted }}>{t.cat}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: t.income ? T.income : T.expense }}>{t.amt}</div>
          </div>
        ))}
      </div>
      {/* bottom bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "12px 0 18px",
          marginTop: 14,
          background: T.canvas,
          borderTop: "1px solid #ececec",
        }}
      >
        {["Home", "Calendar", "", "List", "You"].map((l, i) =>
          i === 2 ? (
            <span
              key={i}
              style={{
                width: 42,
                height: 42,
                borderRadius: 9999,
                background: T.primary,
                color: T.onDark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginTop: -22,
                boxShadow: "rgba(0,102,204,0.4) 0px 8px 18px -4px",
              }}
            >
              +
            </span>
          ) : (
            <span key={i} style={{ fontSize: 10, color: i === 0 ? T.primary : T.textMuted, fontWeight: i === 0 ? 600 : 400 }}>
              {l}
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── App screen: Calendar ─────────────────────────────────────────────────────
export function ScreenCalendar() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 35 }, (_, i) => {
    const d = i - 0;
    const day = d >= 1 && d <= 30 ? d : null;
    return { day, e: day ? day % 2 === 1 : false, in: day ? [4, 12, 25].includes(day) : false };
  });
  return (
    <div style={{ height: "100%", fontFamily: T.fontText, background: T.canvas, padding: "44px 16px 16px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: "-0.3px", marginBottom: 14 }}>June 2026</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
        {days.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: T.textMuted }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "8px 0" }}>
        {cells.map((c, i) => (
          <div key={i} style={{ textAlign: "center", minHeight: 34 }}>
            {c.day && (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: c.day === 4 ? T.onDark : T.ink,
                    fontWeight: c.day === 4 ? 700 : 400,
                    width: 24,
                    height: 24,
                    lineHeight: "24px",
                    borderRadius: 9999,
                    margin: "0 auto",
                    background: c.day === 4 ? T.primary : "transparent",
                  }}
                >
                  {c.day}
                </div>
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 3 }}>
                  {c.e && <span style={{ width: 4, height: 4, borderRadius: 9999, background: T.expense }} />}
                  {c.in && <span style={{ width: 4, height: 4, borderRadius: 9999, background: T.income }} />}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, background: T.canvasParchment, borderRadius: 14, padding: "12px 14px" }}>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Wed, June 4</div>
        {[
          { l: "Salary", a: "+Rp 8.500.000", inc: true },
          { l: "Groceries", a: "-Rp 185.000", inc: false },
        ].map((t) => (
          <div key={t.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
            <span style={{ fontSize: 12, color: T.ink }}>{t.l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.inc ? T.income : T.expense }}>{t.a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App screen: Savings goals ────────────────────────────────────────────────
export function ScreenSavings() {
  const goals = [
    { 
      l: "Dana Darurat", 
      c: 25.5, 
      t: 30, 
      pct: 85, 
      color: T.primary,
      icon: "🛡️",
      deadline: "Des 2026"
    },
    { 
      l: "Liburan Jepang", 
      c: 12.8, 
      t: 32, 
      pct: 40, 
      color: "#7c3aed",
      icon: "✈️",
      deadline: "Jun 2027"
    },
    { 
      l: "Investasi Portofolio", 
      c: 45.0, 
      t: 50, 
      pct: 90, 
      color: T.income,
      icon: "📈",
      deadline: "Mar 2027"
    },
  ];
  
  const totalSaved = goals.reduce((sum, g) => sum + g.c, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.t, 0);
  
  return (
    <div style={{ 
      height: "100%", 
      fontFamily: T.fontText, 
      background: "linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)", 
      padding: "48px 20px 20px",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 600, 
          letterSpacing: "0.08em", 
          textTransform: "uppercase", 
          color: T.textMuted,
          marginBottom: 6
        }}>
          Target Tabungan
        </div>
        <div style={{ 
          fontSize: 22, 
          fontWeight: 700, 
          color: T.ink, 
          letterSpacing: "-0.5px",
          marginBottom: 4
        }}>
          Rencana Keuangan
        </div>
      </div>

      {/* Summary Card */}
      <div style={{ 
        background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)", 
        borderRadius: 20, 
        padding: "20px 22px", 
        marginBottom: 20,
        boxShadow: "0 8px 24px rgba(0, 102, 204, 0.15)"
      }}>
        <div style={{ 
          fontSize: 12, 
          color: "rgba(255,255,255,0.8)", 
          marginBottom: 8,
          fontWeight: 500
        }}>
          Total Tersimpan
        </div>
        <div style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: "#ffffff", 
          letterSpacing: "-0.8px",
          marginBottom: 14
        }}>
          Rp {totalSaved.toFixed(1)}jt
        </div>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 8,
          fontSize: 13,
          color: "rgba(255,255,255,0.9)"
        }}>
          <span style={{ fontWeight: 600 }}>
            {Math.round((totalSaved / totalTarget) * 100)}%
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            dari target Rp {totalTarget}jt
          </span>
        </div>
      </div>

      {/* Goals List */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {goals.map((g) => (
          <div 
            key={g.l} 
            style={{ 
              background: "#ffffff", 
              borderRadius: 16, 
              padding: "18px 20px", 
              marginBottom: 12,
              border: "1px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s"
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-start",
              marginBottom: 12 
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  marginBottom: 6
                }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: T.ink,
                    letterSpacing: "-0.2px"
                  }}>
                    {g.l}
                  </div>
                </div>
                <div style={{ 
                  fontSize: 11, 
                  color: T.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span>Target: {g.deadline}</span>
                </div>
              </div>
              <div style={{ 
                background: `${g.color}15`,
                color: g.color,
                fontSize: 16, 
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 10
              }}>
                {g.pct}%
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ 
                height: 8, 
                borderRadius: 9999, 
                background: "#f0f0f0", 
                overflow: "hidden",
                position: "relative"
              }}>
                <div style={{ 
                  width: `${g.pct}%`, 
                  height: "100%", 
                  background: `linear-gradient(90deg, ${g.color} 0%, ${g.color}dd 100%)`,
                  borderRadius: 9999,
                  transition: "width 0.4s ease"
                }} />
              </div>
            </div>

            {/* Amount Info */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12
            }}>
              <div style={{ color: T.textMuted }}>
                Terkumpul: <span style={{ fontWeight: 600, color: T.ink }}>Rp {g.c}jt</span>
              </div>
              <div style={{ color: T.textMuted }}>
                Target: <span style={{ fontWeight: 600, color: T.ink }}>Rp {g.t}jt</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
