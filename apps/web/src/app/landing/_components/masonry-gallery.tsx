"use client";

import { useState } from "react";
import Image from "next/image";
import { T } from "./tokens";

interface GalleryImage {
  image: string;
  alt: string;
  height?: "short" | "medium" | "tall"; // untuk variasi tinggi
}

export function MasonryGallery({ images }: { images: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const getHeight = (height?: "short" | "medium" | "tall") => {
    // Responsive heights - smaller on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    if (isMobile) {
      switch (height) {
        case "short":
          return 200;
        case "tall":
          return 320;
        default:
          return 260; // medium
      }
    }
    
    // Desktop heights
    switch (height) {
      case "short":
        return 280;
      case "tall":
        return 500;
      default:
        return 380; // medium
    }
  };

  return (
    <>
      {/* Responsive styles for masonry */}
      <style jsx>{`
        .masonry-gallery {
          column-count: 1;
          column-gap: 16px;
          width: 100%;
        }
        @media (min-width: 640px) {
          .masonry-gallery {
            column-count: 2;
          }
        }
      `}</style>

      {/* Masonry Grid */}
      <div
        className="masonry-gallery"
        style={{
          width: "100%",
        }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(index)}
            style={{
              position: "relative",
              height: getHeight(img.height),
              borderRadius: 16,
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              marginBottom: 16,
              breakInside: "avoid",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            <Image src={img.image} alt={img.alt} fill sizes="(max-width: 880px) 100vw, 400px" style={{ objectFit: "cover" }} />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            cursor: "pointer",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 1000,
              height: "80vh",
              borderRadius: 12,
              overflow: "hidden",
              cursor: "default",
            }}
          >
            <Image
              src={images[selectedImage].image}
              alt={images[selectedImage].alt}
              fill
              sizes="(max-width: 1200px) 100vw, 1000px"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: 700,
              color: T.ink,
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
