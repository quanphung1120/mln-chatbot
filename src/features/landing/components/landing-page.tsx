import React from "react";
import HeaderAuth from "./header-auth";
import HeroAuth from "./hero-auth";
import CtaAuth from "./cta-auth";
import FaqSection from "./faq-section";

/* ─────────────────────────────────────────────
   Inline CSS custom properties (monopo style)
   ───────────────────────────────────────────── */
const monopoVars = `
  @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600&display=swap');

  .monopo-page {
    --color-midnight-canvas: #000000;
    --color-frost-white: #ffffff;
    --color-deep-shadow: #181818;
    --color-whisper-gray: #6d6d6d;
    --color-misty-gray: #636363;
    --gradient-deep-ocean: linear-gradient(90deg, rgb(160, 224, 171), rgb(255, 172, 46) 50%, rgb(165, 45, 37));
    --radius-buttons: 75.024px;
    --radius-cards: 10px;
    --page-max-width: 1078px;
    --font-heading: 'Raleway', system-ui, sans-serif;
    --font-body: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;

export default function LandingPage() {
  return (
    <>
      {/* Inject Google Font + monopo custom properties */}
      <style
        // TODO(security): This inline style is hardcoded static CSS with no user input — safe from injection.
        dangerouslySetInnerHTML={{ __html: monopoVars }}
      />

      <div
        className="monopo-page"
        style={{
          background: "var(--color-midnight-canvas)",
          color: "var(--color-frost-white)",
          fontFamily: "var(--font-body)",
          minHeight: "100vh",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* ══════════════════════════════════════════
            STICKY NAVIGATION
        ══════════════════════════════════════════ */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            width: "100%",
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              maxWidth: "var(--page-max-width)",
              margin: "0 auto",
              padding: "0 28px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <a
              href="#"
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: "16px",
                color: "var(--color-frost-white)",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              MLN <span style={{ color: "var(--color-whisper-gray)", fontWeight: 300 }}>Portal</span>
            </a>

            {/* Nav links */}
            <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              <a href="#features-section" style={navLinkStyle}>Features</a>
              <a href="#syllabus-section" style={navLinkStyle}>Syllabus</a>
              <a href="#faq-section" style={navLinkStyle}>FAQ</a>

              <HeaderAuth />
            </nav>
          </div>
        </header>

        {/* ══════════════════════════════════════════
            HERO — Full-bleed gradient atmosphere
        ══════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            width: "100%",
            minHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Atmospheric gradient blob background */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: "var(--color-midnight-canvas)",
            }}
          >
            {/* Primary gradient sphere — left */}
            <div style={gradientBlob("40%", "-10%", "700px", "ellipse(52% 44% at 30% 55%)", "radial-gradient(ellipse at 30% 55%, rgba(160,224,171,0.45) 0%, transparent 65%)", "floatA 14s ease-in-out infinite")} />
            {/* Secondary gradient sphere — right amber */}
            <div style={gradientBlob("10%", "55%", "600px", undefined, "radial-gradient(ellipse at 70% 40%, rgba(255,172,46,0.38) 0%, transparent 60%)", "floatB 18s ease-in-out infinite")} />
            {/* Tertiary gradient sphere — deep red */}
            <div style={gradientBlob("50%", "65%", "500px", undefined, "radial-gradient(ellipse at 80% 80%, rgba(165,45,37,0.42) 0%, transparent 58%)", "floatC 22s ease-in-out infinite")} />
            {/* Dark canvas veil on top to keep text readable */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.62) 100%)",
              }}
            />
          </div>

          {/* Hero content */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              maxWidth: "var(--page-max-width)",
              width: "100%",
              padding: "0 28px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {/* Eyebrow label */}
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 400,
              }}
            >
              FPT University · Marxist-Leninist Reference System
            </span>

            {/* Display headline — Raleway */}
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                fontSize: "clamp(42px, 8vw, 94px)",
                lineHeight: 1.05,
                color: "var(--color-frost-white)",
                margin: 0,
                maxWidth: "860px",
              }}
            >
              Accurate MLN<br />
              <span
                style={{
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Reference & Verification
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.6)",
                maxWidth: "540px",
                margin: 0,
                fontWeight: 300,
              }}
            >
              Instantly search, cite, and verify Marxist-Leninist theory against official FPT slide materials for MLN111, MLN122, and MLN131.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
              <HeroAuth />
            </div>

            {/* Subtle scroll indicator */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "20px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Scroll</span>
              <div
                style={{
                  width: "1px",
                  height: "52px",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURES SECTION
        ══════════════════════════════════════════ */}
        <section
          id="features-section"
          style={{
            background: "var(--color-midnight-canvas)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "120px 28px",
          }}
        >
          <div style={{ maxWidth: "var(--page-max-width)", margin: "0 auto" }}>
            {/* Section header */}
            <div style={{ marginBottom: "68px" }}>
              <span style={eyebrow}>Product Capabilities</span>
              <h2 style={sectionHeading}>Precision Tools for<br />MLN Study</h2>
            </div>

            {/* Feature cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
                gap: "1px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {[
                {
                  num: "01",
                  title: "Rapid Slide Search",
                  body: "Search instantly for complex concepts and definitions. Retrieve the exact quote and official slide number within the FPT curriculum.",
                  gradient: "radial-gradient(ellipse at 0% 0%, rgba(160,224,171,0.12) 0%, transparent 70%)",
                },
                {
                  num: "02",
                  title: "Precise Slide Citations",
                  body: "Every explanation is accompanied by chapter, section, and slide numbers — ensuring highly reliable knowledge verification.",
                  gradient: "radial-gradient(ellipse at 50% 0%, rgba(255,172,46,0.12) 0%, transparent 70%)",
                },
                {
                  num: "03",
                  title: "Verify & Cross-Reference",
                  body: "Cross-reference answers with original learning sources. Verify the accuracy of arguments for a comprehensive understanding.",
                  gradient: "radial-gradient(ellipse at 100% 0%, rgba(165,45,37,0.14) 0%, transparent 70%)",
                },
              ].map((f) => (
                <div
                  key={f.num}
                  style={{
                    background: `${f.gradient}, var(--color-deep-shadow)`,
                    padding: "48px 40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    transition: "background 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "11px",
                      letterSpacing: "0.2em",
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 300,
                    }}
                  >
                    {f.num}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 400,
                      fontSize: "29px",
                      lineHeight: 1.21,
                      color: "var(--color-frost-white)",
                      margin: 0,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "16px",
                      lineHeight: 1.65,
                      color: "var(--color-whisper-gray)",
                      margin: 0,
                      fontWeight: 300,
                    }}
                  >
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            GRADIENT DIVIDER BAND
        ══════════════════════════════════════════ */}
        <div
          aria-hidden
          style={{
            width: "100%",
            height: "3px",
            background: "var(--gradient-deep-ocean)",
            opacity: 0.7,
          }}
        />

        {/* ══════════════════════════════════════════
            SYLLABUS SECTION
        ══════════════════════════════════════════ */}
        <section
          id="syllabus-section"
          style={{
            background: "var(--color-midnight-canvas)",
            padding: "120px 28px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ maxWidth: "var(--page-max-width)", margin: "0 auto" }}>
            <div style={{ marginBottom: "64px", textAlign: "center" }}>
              <span style={eyebrow}>3 Subject Codes</span>
              <h2 style={{ ...sectionHeading, textAlign: "center" }}>MLN Knowledge Scope</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
              {[
                {
                  code: "MLN111",
                  semester: "Semester 8",
                  title: "Philosophy of Marxism–Leninism",
                  desc: "Marxist-Leninist Philosophy provides a system of dialectical materialism and scientific materialist dialectic methodology. Explores the nature of the world, humans, and society.",
                  topics: ["Definition of Matter & Origin of Consciousness", "2 Principles & 3 Laws of Dialectics", "6 Pairs of Basic Dialectical Categories", "Socio-Economic Formations & Historical Materialism"],
                  accent: "rgba(160,224,171,0.1)",
                },
                {
                  code: "MLN122",
                  semester: "Semester 8",
                  title: "Political Economics of Marxism–Leninism",
                  desc: "Examines economic laws operating within the capitalist mode of production, the nature of surplus value, and the socialist-oriented market economy in Vietnam.",
                  topics: ["Commodities, Currency & Market Laws", "Theory of Surplus Value (M – C – M')", "Capital Accumulation & Monopolistic Competition", "Socialist-Oriented Market Economy"],
                  accent: "rgba(255,172,46,0.1)",
                },
                {
                  code: "MLN131",
                  semester: "Semester 9",
                  title: "Scientific Socialism",
                  desc: "Studies the laws and revolutionary path leading to the communist socio-economic formation, the historical mission of the working class, and issues of religion, nation, and family.",
                  topics: ["Historical Mission of the Working Class", "Transition Period & Socialist Formations", "Social-Class Structure & Class Alliance", "National, Religious & Family Issues"],
                  accent: "rgba(165,45,37,0.12)",
                },
              ].map((s) => (
                <div
                  key={s.code}
                  style={{
                    background: `radial-gradient(ellipse at 0% 50%, ${s.accent} 0%, transparent 60%), var(--color-deep-shadow)`,
                    padding: "48px 40px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "48px",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.18em",
                          color: "rgba(255,255,255,0.4)",
                          textTransform: "uppercase",
                          fontWeight: 300,
                        }}
                      >
                        {s.semester}
                      </span>
                      <div style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.15)" }} />
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "12px",
                          letterSpacing: "0.15em",
                          color: "rgba(255,255,255,0.6)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {s.code}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 400,
                        fontSize: "clamp(22px, 2.5vw, 39px)",
                        lineHeight: 1.15,
                        color: "var(--color-frost-white)",
                        margin: "0 0 20px",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p style={{ fontSize: "16px", lineHeight: 1.65, color: "var(--color-whisper-gray)", margin: 0, fontWeight: 300 }}>
                      {s.desc}
                    </p>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.18em",
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "20px",
                        fontWeight: 300,
                      }}
                    >
                      Core Topics
                    </span>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                      {s.topics.map((t) => (
                        <li
                          key={t}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            fontSize: "16px",
                            lineHeight: 1.5,
                            color: "rgba(255,255,255,0.72)",
                            fontWeight: 300,
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, marginTop: "2px" }}>—</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIAL PULL QUOTE
        ══════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "120px 28px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "var(--color-midnight-canvas)",
          }}
        >
          {/* Atmospheric blob */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,172,46,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: "740px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "120px",
                lineHeight: 0.7,
                color: "rgba(255,255,255,0.06)",
                marginBottom: "-20px",
                userSelect: "none",
              }}
              aria-hidden
            >
              &quot;
            </div>
            <blockquote
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(20px, 3vw, 39px)",
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.82)",
                margin: "0 0 48px",
              }}
            >
              Thanks to the precise verification system based on MLN111 slide materials, I can quickly clarify abstract concepts like matter, consciousness, and dialectical laws. The slide mapping is incredibly accurate!
            </blockquote>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontSize: "12px", letterSpacing: "0.15em", color: "var(--color-frost-white)", textTransform: "uppercase", fontWeight: 400 }}>
                Hoang Nam Khanh
              </span>
              <span style={{ fontSize: "11px", color: "var(--color-whisper-gray)", letterSpacing: "0.08em" }}>
                K18 Software Engineering · FPT Hoa Lac
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FAQ SECTION
        ══════════════════════════════════════════ */}
        <FaqSection />

        {/* ══════════════════════════════════════════
            FINAL CTA — GRADIENT HERO REPRISE
        ══════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "140px 28px",
            textAlign: "center",
            background: "var(--color-midnight-canvas)",
          }}
        >
          {/* Re-use deep ocean blobs */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ ...gradientBlob("20%", "-5%", "600px", undefined, "radial-gradient(ellipse at 20% 50%, rgba(160,224,171,0.35) 0%, transparent 65%)", "floatA 16s ease-in-out infinite"), opacity: 0.7 }} />
            <div style={{ ...gradientBlob("30%", "60%", "550px", undefined, "radial-gradient(ellipse at 80% 50%, rgba(165,45,37,0.35) 0%, transparent 62%)", "floatC 20s ease-in-out infinite"), opacity: 0.7 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 1, maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
            <span style={eyebrow}>Accurate Reference</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                fontSize: "clamp(36px, 6vw, 78px)",
                lineHeight: 1.1,
                color: "var(--color-frost-white)",
                margin: 0,
              }}
            >
              Begin Your<br />
              <span style={{ fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>
                MLN Search
              </span>
            </h2>
            <p style={{ fontSize: "16px", lineHeight: 1.65, color: "rgba(255,255,255,0.55)", maxWidth: "460px", margin: 0, fontWeight: 300 }}>
              High-accuracy reference search for Marxist-Leninist theory, grounded in FPT official study materials.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
              <CtaAuth />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════ */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "var(--color-midnight-canvas)",
            padding: "48px 28px",
          }}
        >
          <div
            style={{
              maxWidth: "var(--page-max-width)",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-whisper-gray)",
                letterSpacing: "0.06em",
                fontWeight: 300,
              }}
            >
              MLN FPT Study Portal © 2026 · Made for FPT University Students
            </span>
            <div style={{ display: "flex", gap: "28px" }}>
              {["Terms", "Privacy", "Contact"].map((l) => (
                <span
                  key={l}
                  className="footer-link"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </footer>

        {/* Keyframe animations */}
        <style>{`
          @keyframes floatA {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(40px, -30px) scale(1.08); }
            66% { transform: translate(-25px, 20px) scale(0.95); }
          }
          @keyframes floatB {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-50px, 35px) scale(1.06); }
            66% { transform: translate(30px, -20px) scale(0.97); }
          }
          @keyframes floatC {
            0%, 100% { transform: translate(0, 0) scale(1); }
            40% { transform: translate(35px, 25px) scale(1.05); }
            70% { transform: translate(-20px, -35px) scale(0.96); }
          }

          .monopo-page a { color: inherit; text-decoration: none; }

          .footer-link {
            font-size: 11px;
            letter-spacing: 0.12em;
            color: var(--color-whisper-gray);
            text-transform: uppercase;
            cursor: pointer;
            transition: color 0.2s;
          }
          .footer-link:hover {
            color: var(--color-frost-white) !important;
          }

          /* Accordion overrides for dark theme */
          .monopo-page [data-radix-accordion-trigger] {
            color: #ffffff !important;
          }
          .monopo-page [data-radix-accordion-content] {
            color: #6d6d6d !important;
          }
        `}</style>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Shared inline style objects
   ───────────────────────────────────────────── */
const navLinkStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.65)",
  letterSpacing: "0.04em",
  cursor: "pointer",
  transition: "color 0.2s",
  fontWeight: 300,
};

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  fontWeight: 300,
  display: "block",
  marginBottom: "20px",
};

const sectionHeading: React.CSSProperties = {
  fontFamily: "'Raleway', system-ui, sans-serif",
  fontWeight: 400,
  fontSize: "clamp(30px, 4vw, 54px)",
  lineHeight: 1.15,
  color: "#ffffff",
  margin: 0,
};

/* Helper: atmospheric gradient blob */
function gradientBlob(
  top: string,
  left: string,
  size: string,
  clipPath?: string,
  background?: string,
  animation?: string,
): React.CSSProperties {
  return {
    position: "absolute",
    top,
    left,
    width: size,
    height: size,
    background: background ?? "transparent",
    clipPath,
    animation,
    willChange: "transform",
    pointerEvents: "none",
  };
}
