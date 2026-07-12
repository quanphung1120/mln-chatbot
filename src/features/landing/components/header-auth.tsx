"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeaderAuth() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            Đăng nhập
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">Bắt đầu miễn phí</Button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
          Bảng điều khiển
        </Button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </div>
  );
}
