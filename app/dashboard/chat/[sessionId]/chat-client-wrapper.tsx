"use client";

import dynamic from "next/dynamic";

const ChatClient = dynamic(
  () => import("./chat-client").then((mod) => mod.ChatClient),
  { ssr: false }
);

interface ChatClientWrapperProps {
  sessionId: string;
  initialMessages: any[];
}

export function ChatClientWrapper(props: ChatClientWrapperProps) {
  return <ChatClient {...props} />;
}
