"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

export default function FaqSection() {
  return (
    <section
      id="faq-section"
      style={{
        background: "var(--color-midnight-canvas)",
        padding: "120px 28px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={eyebrow}>FAQ</span>
          <h2 style={{ ...sectionHeading, textAlign: "center" }}>Common Questions</h2>
        </div>

        <Accordion className="w-full">
          {[
            {
              q: "How does this tool guarantee alignment with FPT slides?",
              a: "The system is compiled directly from official MLN slide repositories (MLN111, MLN122, MLN131) across all FPT campuses. All definitions and reference materials are cross-checked and validated against the official Ministry of Education textbooks.",
              id: "faq-1",
            },
            {
              q: "Can students from all FPT campuses use this together?",
              a: "Absolutely! Although class schedules and syllabus distribution may vary slightly across campuses, the core concepts of Marxist-Leninist subjects are completely unified and standardized based on the Ministry's curriculum.",
              id: "faq-2",
            },
            {
              q: "Can I rely on these explanations for essays and research papers?",
              a: "The system is designed to provide precise research and reference tools. Every response cites official slide references to let you easily cross-verify. For essays or academic research, this serves as an extremely reliable guidance and reference source.",
              id: "faq-3",
            },
          ].map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <AccordionTrigger
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: 1.4,
                  color: "var(--color-frost-white)",
                  padding: "28px 15px",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                }}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent
                style={{
                  fontSize: "16px",
                  lineHeight: 1.7,
                  color: "var(--color-whisper-gray)",
                  padding: "0 15px 28px",
                  fontWeight: 300,
                }}
              >
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
