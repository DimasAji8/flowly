"use client";

import { useState } from "react";
import { Star, CheckCircle2, MessageSquareQuote, Quote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { reviewService } from "@/services/review.service";
import { T } from "./tokens";
import { Reveal } from "./primitives";

// ─── Star picker ──────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexDirection: "row-reverse",
        justifyContent: "flex-end",
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const star = 5 - i;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rf-star-btn"
            aria-label={`${star} bintang`}
          >
            <Star
              size={30}
              fill={star <= value ? T.primary : "none"}
              color={star <= value ? T.primary : "#d2d2d7"}
              strokeWidth={star <= value ? 0 : 1.5}
              className="rf-star-icon"
            />
          </button>
        );
      })}
    </div>
  );
}

// ─── Quote mark decoration ────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function QuoteMark({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width={40}
      height={32}
      viewBox="0 0 40 32"
      fill="none"
      style={style}
    >
      <path
        d="M12.8 0C14.93 0 16.61.64 17.84 1.92 19.09 3.2 19.71 4.91 19.71 7.04c0 2.13-.62 3.84-1.87 5.12-1.25 1.28-2.93 1.92-5.04 1.92-2.32 0-4.11-.85-5.36-2.56C6.2 9.81 5.57 7.52 5.57 4.64 5.57 1.55 7.68 0 12.8 0Zm19.2 0c2.13 0 3.81.64 5.04 1.92 1.23 1.28 1.84 2.99 1.84 5.12 0 2.13-.61 3.84-1.84 5.12-1.23 1.28-2.91 1.92-5.04 1.92-2.32 0-4.11-.85-5.36-2.56-1.25-1.71-1.87-4-1.87-6.88 0-3.09 2.1-4.64 7.23-4.64Z"
        fill="currentColor"
        opacity="0.08"
      />
    </svg>
  );
}

// ─── Review Form Section ──────────────────────────────────────────────────
export function ReviewFormSection() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    if (rating === 0) {
      setError("Silakan pilih rating");
      return;
    }
    if (content.trim().length < 10) {
      setError("Review minimal 10 karakter");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await reviewService.create({
        name: name.trim(),
        rating,
        content: content.trim(),
      });
      setName("");
      setRating(0);
      setContent("");
      setToast("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim review",
      );
      setToast("error");
    } finally {
      setLoading(false);
    }
    setTimeout(() => setToast(null), 4000);
  };

  // ── Form ─────────────────────────────────────────────────────────────
  return (
    <section
      id="review-form"
      style={{
        background: T.canvasParchment,
        padding: "clamp(72px, 10vw, 120px) 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.tintBlue} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.tintLilac} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Reveal>
        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.primary,
                marginBottom: 16,
                background: T.primarySoft,
                padding: "6px 16px",
                borderRadius: 100,
              }}
            >
              <MessageSquareQuote size={14} />
              Bagikan Pengalaman
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: T.ink,
                marginBottom: 14,
                lineHeight: 1.2,
              }}
            >
              Suarakan opini{" "}
              <span style={{ color: T.primary }}>Anda</span>
            </h2>
            <p
              style={{
                fontFamily: T.fontText,
                fontSize: "clamp(15px, 1.6vw, 17px)",
                color: T.textMuted,
                lineHeight: 1.7,
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              Setiap masukan membantu kami terus berkembang. Ceritakan
              pengalaman Anda menggunakan Teman Kas.
            </p>
          </div>

          {/* Grid: left — form, right — decorative quote */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 32,
              alignItems: "start",
            }}
            className="rf-grid"
          >
            {/* ── Toast notification ──────────────────────────────── */}
            {toast === "success" && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#15803d",
                  color: "#fff",
                  padding: "14px 20px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 4px 16px rgba(21,128,61,0.25)",
                  animation: "fadeSlideDown 0.4s ease",
                }}
              >
                <CheckCircle2 size={18} />
                Review berhasil dikirim! Terima kasih atas masukan Anda.
              </div>
            )}
            {toast === "error" && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#dc2626",
                  color: "#fff",
                  padding: "14px 20px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 4px 16px rgba(220,38,38,0.25)",
                  animation: "fadeSlideDown 0.4s ease",
                }}
              >
                Gagal mengirim review. Silakan coba lagi.
              </div>
            )}

            {/* ── Form card ──────────────────────────────────────────── */}
            <div className="rf-form-card">
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 22 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textMuted,
                      marginBottom: 10,
                    }}
                  >
                    Nama
                  </label>
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Andi Pratama"
                    maxLength={100}
                    className="rf-input"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textMuted,
                      marginBottom: 10,
                    }}
                  >
                    Rating
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Content */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textMuted,
                      marginBottom: 8,
                    }}
                  >
                    Ulasan
                  </label>
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Apa yang paling Anda sukai dari Teman Kas? Ceritakan fitur favorit, kemudahan penggunaan, atau pengalaman sehari-hari..."
                      maxLength={500}
                      rows={5}
                      className="rf-textarea"
                    />
                  </div>
                  <span
                    style={{
                      display: "block",
                      textAlign: "right",
                      fontSize: 11,
                      color: T.textMuted,
                      marginTop: 6,
                    }}
                  >
                    <span
                      style={{
                        color: content.length > 400 ? "#dc2626" : "inherit",
                      }}
                    >
                      {content.length}
                    </span>
                    /500
                  </span>
                </div>

                <FormError message={error} />

                <button
                  type="submit"
                  disabled={loading}
                  className="rf-btn rf-btn-primary"
                >
                  {loading ? "Mengirim..." : "Kirim Review"}
                </button>
              </form>
            </div>

            {/* ── Decorative sidebar ─────────────────────────────────── */}
            <div className="rf-sidebar">
              <div className="rf-sidebar-inner">
                <Quote
                  size={28}
                  color={T.primary}
                  strokeWidth={1.5}
                  style={{ opacity: 0.3, marginBottom: 16 }}
                />
                <p
                  style={{
                    fontFamily: T.fontText,
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: T.textMuted,
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  &ldquo;Aplikasi keuangan terbaik yang pernah saya gunakan.
                  Antarmuka yang bersih dan fitur yang lengkap.&rdquo;
                </p>
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: `1px solid ${T.hairline}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: T.primarySoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.primary,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    S
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.ink,
                      }}
                    >
                      Sarah
                    </span>
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          fill={T.primary}
                          color={T.primary}
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <style>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rf-star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          line-height: 0;
        }
        .rf-star-btn:hover {
          transform: scale(1.25);
        }
        .rf-star-btn:hover ~ .rf-star-btn {
          transform: scale(1.1);
        }
        .rf-star-icon {
          transition: all 0.2s ease;
        }
        .rf-star-btn:hover .rf-star-icon {
          fill: ${T.primary};
          color: ${T.primary};
          stroke-width: 0;
        }

        .rf-input {
          padding-left: 16px !important;
          height: 48px !important;
          font-size: 15px !important;
        }
        .rf-input::placeholder {
          color: #aeaeb2 !important;
          font-size: 14px !important;
        }

        .rf-form-card {
          background: ${T.canvas};
          border-radius: 28px;
          border: 1px solid ${T.hairline};
          padding: clamp(28px, 3.6vw, 44px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02);
        }

        .rf-textarea {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border-subtle);
          font-size: 15px;
          outline: none;
          resize: none;
          font-family: inherit;
          background: var(--color-card-subtle);
          color: var(--color-text-primary);
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          line-height: 1.65;
        }
        .rf-textarea::placeholder {
          color: #aeaeb2;
          font-size: 14px;
        }
        .rf-textarea:focus {
          border-color: var(--color-accent);
          background: var(--color-card);
          box-shadow: 0 0 0 4px var(--color-accent-soft);
        }

        .rf-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.25s, transform 0.2s;
          font-family: inherit;
        }
        .rf-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDeep} 100%);
          color: #fff;
          box-shadow: 0 4px 16px ${T.primary}33;
        }
        .rf-btn-primary:not(:disabled):hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px ${T.primary}44;
        }
        .rf-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rf-sidebar {
          position: sticky;
          top: 100px;
        }
        .rf-sidebar-inner {
          background: ${T.canvas};
          border-radius: 28px;
          border: 1px solid ${T.hairline};
          padding: 32px 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
        }

        @media (max-width: 768px) {
          .rf-grid {
            grid-template-columns: 1fr !important;
          }
          .rf-sidebar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
