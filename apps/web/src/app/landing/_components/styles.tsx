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
        .lp-feature-grid .lp-feature-copy { align-items: center; }
        .lp-feature-grid .lp-feature-actions { justify-content: center; }
        .lp-feature-img { aspect-ratio: 3 / 2 !important; max-height: 280px; }
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
