"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";

const heroPrimaryBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  color: "#000000",
  border: "1px solid transparent",
  borderRadius: "75.024px",
  padding: "14px 40px",
  fontSize: "15px",
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  fontWeight: 400,
  transition: "background 0.2s, transform 0.15s",
};

const heroGhostBtn: React.CSSProperties = {
  background: "transparent",
  color: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "75.024px",
  padding: "14px 40px",
  fontSize: "15px",
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  fontWeight: 300,
  transition: "border-color 0.2s, color 0.2s",
};

export default function CtaAuth() {
  return (
    <>
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <button style={heroPrimaryBtn} id="cta-signup-btn">
            Start for Free
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button style={heroGhostBtn} id="cta-signin-btn">
            Sign In
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <a href="/dashboard">
          <button style={heroPrimaryBtn} id="cta-dashboard-btn">
            Open Dashboard
          </button>
        </a>
      </Show>
    </>
  );
}
