import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import React from "react";

const ghostPillBtn: React.CSSProperties = {
  background: "transparent",
  color: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "75.024px",
  padding: "8px 22px",
  fontSize: "13px",
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  fontWeight: 300,
  transition: "border-color 0.2s, color 0.2s",
};

const solidPillBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  color: "#000000",
  border: "1px solid transparent",
  borderRadius: "75.024px",
  padding: "8px 22px",
  fontSize: "13px",
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  fontWeight: 400,
  transition: "background 0.2s",
};

export default function HeaderAuth() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button style={ghostPillBtn} id="nav-signin-btn">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button style={solidPillBtn} id="nav-signup-btn">
            Get Started
          </button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <a href="/dashboard">
          <button style={solidPillBtn} id="nav-dashboard-btn">
            Dashboard
          </button>
        </a>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-full border border-white/30",
            },
          }}
        />
      </Show>
    </>
  );
}
