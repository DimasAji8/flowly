"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { reviewService, type Review } from "@/services/review.service";
import { T } from "./tokens";
import { Reveal } from "./primitives";

// ─── Review card ───────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      style={{
        background: T.canvas,
        borderRadius: 28,
        border: `1px solid ${T.hairline}`,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      {/* Quote icon */}
      <Quote
        size={28}
        color={T.primary}
        strokeWidth={1.5}
        style={{ opacity: 0.3, marginBottom: 16 }}
      />

      {/* Quote text */}
      <p
        style={{
          fontFamily: T.fontText,
          fontSize: 15,
          lineHeight: 1.8,
          color: T.textMuted,
          fontStyle: "italic",
          flex: 1,
          margin: 0,
        }}
      >
        {review.content}
      </p>

      {/* Divider + author */}
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
          {review.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: T.ink,
            }}
          >
            {review.name}
          </span>
          <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                fill={i < review.rating ? T.primary : "none"}
                color={i < review.rating ? T.primary : T.hairline}
                strokeWidth={i < review.rating ? 0 : 1.5}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Carousel dots ─────────────────────────────────────────────────────────
function DotButtons({
  api,
  count,
}: {
  api: CarouselApi | null;
  count: number;
}) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 32,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => api?.scrollTo(i)}
          style={{
            width: i === selected ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === selected ? T.primary : T.hairline,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          aria-label={`Lihat review ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── Review Carousel Section ───────────────────────────────────────────────
export function ReviewCarouselSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    reviewService.getShown().then(setReviews).catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section
      id="reviews"
      style={{
        background: T.canvas,
        padding: "clamp(64px, 10vw, 100px) 24px",
      }}
    >
      <Reveal>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.primary,
                marginBottom: 14,
              }}
            >
              Testimoni
            </p>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: T.ink,
                marginBottom: 12,
              }}
            >
              Apa kata pengguna?
            </h2>
            <p
              style={{
                fontFamily: T.fontText,
                fontSize: "clamp(15px, 1.8vw, 17px)",
                color: T.textMuted,
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              Mereka yang sudah merasakan kemudahan mencatat keuangan dengan Teman Kas.
            </p>
          </div>

          {/* Carousel */}
          <div style={{ position: "relative", padding: "0 20px" }}>
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="gap-6 md:gap-8">
                {reviews.map((review) => (
                  <CarouselItem
                    key={review.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <ReviewCard review={review} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>

          <DotButtons api={api} count={reviews.length} />
        </div>
      </Reveal>
    </section>
  );
}
