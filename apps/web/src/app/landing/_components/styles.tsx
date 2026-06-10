import { T } from "./tokens";

// Global <style> for the landing page. Kept in one place so layout/media-query
// rules are easy to maintain.
export function LandingStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }

      /* Hero two-column */
      .lp-hero-grid {
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 48px;
        align-items: center;
      }
      .lp-hero-copy { display: flex; flex-direction: column; }

      /* Hero stats strip */
      .lp-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
      }
      .lp-stats-grid > div + div { border-left: 1px solid ${T.hairline}; }

      @media (max-width: 880px) {
        .lp-hero-grid { grid-template-columns: 1fr; gap: 32px; text-align: center; }
        .lp-hero-copy { align-items: center; }
        .lp-hero-copy > div { justify-content: center; }
      }
      @media (max-width: 720px) {
        .lp-stats-grid { grid-template-columns: 1fr 1fr; }
        .lp-stats-grid > div:nth-child(2) { border-left: 1px solid ${T.hairline}; }
        .lp-stats-grid > div:nth-child(3) { border-left: none; }
        .lp-stats-grid > div:nth-child(3),
        .lp-stats-grid > div:nth-child(4) { margin-top: 24px; }
      }

      /* Feature row two-column */
      .lp-feature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: clamp(28px, 4vw, 56px);
      }
      .lp-feature-grid.lp-reverse { direction: rtl; }
      .lp-feature-grid.lp-reverse > * { direction: ltr; }

      @media (max-width: 880px) {
        .lp-feature-grid { grid-template-columns: 1fr; text-align: center; }
        .lp-feature-grid.lp-reverse { direction: ltr; }
        .lp-feature-grid .lp-feature-copy { align-items: center; order: 1; }
        .lp-feature-grid .lp-feature-visual { order: 2; min-height: unset !important; }
        .lp-feature-grid .lp-feature-actions { justify-content: center; }
        .lp-feature-body { display: none; }
        .lp-feature-cta { display: none !important; }
        .lp-feature-img { aspect-ratio: 4 / 5 !important; max-height: 400px; max-width: 100% !important; min-height: unset !important; }
        
        /* Kalender: side-by-side layout with larger image */
        #calendar .lp-feature-grid { 
          grid-template-columns: 1fr; 
          gap: 24px;
          text-align: left;
        }
        #calendar .lp-feature-copy { 
          align-items: flex-start;
          order: 1;
        }
        #calendar .lp-feature-visual {
          order: 2;
        }
        #calendar .lp-feature-body { 
          display: block; 
          font-size: 15px;
          line-height: 1.5;
        }
        #calendar .lp-feature-img { 
          aspect-ratio: unset !important; 
          max-height: unset !important; 
          max-width: 100% !important; 
          min-height: 350px !important;
        }
        
        /* Savings: stack layout with smaller masonry */
        #savings .lp-feature-grid {
          grid-template-columns: 1fr;
          gap: 32px;
          text-align: left;
        }
        #savings .lp-feature-copy {
          align-items: flex-start;
          order: 1;
        }
        #savings .lp-feature-visual {
          order: 2;
        }
        #savings .lp-feature-body {
          display: block;
        }
        #savings .lp-feature-img {
          aspect-ratio: unset !important;
          max-height: unset !important;
          padding: 0 !important;
        }
      }

      /* Savings visual grid responsive */
      .lp-savings-main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: clamp(40px, 6vw, 80px);
        align-items: center;
      }
      @media (max-width: 880px) {
        .lp-savings-main {
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .lp-phone-wrap {
          max-width: 200px !important;
        }
      }

      /* Social proof grids */
      .lp-testimonial-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      @media (max-width: 880px) {
        .lp-testimonial-grid { grid-template-columns: repeat(2, 1fr); }
        .lp-testimonial-grid > :last-child { grid-column: unset; max-width: unset; }
      }
      @media (max-width: 480px) {
        .lp-testimonial-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      }

      /* Capability grid */
      .lp-cap-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @media (max-width: 880px) {
        .lp-cap-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      }

      .lp-cap-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .lp-cap-card:hover {
        transform: translateY(-3px);
        box-shadow: rgba(0,0,0,0.07) 0px 12px 28px -10px;
      }

      .lp-nav-burger { display: none; }
      @media (max-width: 768px) {
        .lp-nav-links { display: none !important; }
        .lp-nav-cta { display: none !important; }
        .lp-nav-burger { display: flex !important; }
      }

      @media (max-width: 768px) {
        .footer-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 480px) {
        .footer-grid { grid-template-columns: 1fr !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        * { transition: none !important; animation: none !important; }
      }
    `}</style>
  );
}
