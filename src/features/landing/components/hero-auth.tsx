"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroAuth() {
  return (
    <>
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <Button size="lg" className="px-8">
            Bắt đầu học miễn phí
          </Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button size="lg" variant="outline" className="px-8">
            Đăng nhập
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Button size="lg" className="px-8" nativeButton={false} render={<Link href="/dashboard" />}>
          Vào bảng điều khiển
        </Button>
      </Show>
    </>
  );
}
