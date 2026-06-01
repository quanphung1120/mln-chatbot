"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getSessions() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      title: s.title,
    }));
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return [];
  }
}

export async function deleteSessionAction(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  const currentSessionId = formData.get("currentSessionId") as string;

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const result = await prisma.chatSession.deleteMany({
      where: { id: sessionId, userId },
    });

    if (result.count === 0) {
      throw new Error("Session not found or unauthorized");
    }
  } catch (error) {
    console.error("[deleteSessionAction] Failed to delete session:", error);
    throw error;
  }

  revalidatePath("/dashboard");

  if (currentSessionId === sessionId) {
    redirect("/dashboard");
  }
}

export async function renameSessionAction(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  const newTitle = formData.get("title") as string;

  if (!sessionId || !newTitle || !newTitle.trim()) {
    throw new Error("Session ID and title are required");
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const result = await prisma.chatSession.updateMany({
      where: { id: sessionId, userId },
      data: { title: newTitle.trim() },
    });

    if (result.count === 0) {
      throw new Error("Session not found or unauthorized");
    }
  } catch (error) {
    console.error("[renameSessionAction] Failed to rename session:", error);
    throw error;
  }

  revalidatePath("/dashboard");
}
