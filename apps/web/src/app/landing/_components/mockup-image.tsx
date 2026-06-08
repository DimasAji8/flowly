import Image from "next/image";

export function MockupImage() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: "110%",
          aspectRatio: "1 / 1",
          background: `radial-gradient(circle at 50% 42%, rgba(0,102,204,0.16) 0%, rgba(0,102,204,0.05) 46%, rgba(0,102,204,0) 70%)`,
          borderRadius: "46% 54% 52% 48% / 50% 46% 54% 50%",
        }}
      />
      <div 
        style={{ 
          position: "relative", 
          zIndex: 1, 
          width: "100%", 
          maxWidth: "min(420px, 60vw)"
        }}
      >
        <Image
          src="/img/mockup-hero.webp"
          alt="Teman Kas App Mockup"
          width={800}
          height={1600}
          priority
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}
