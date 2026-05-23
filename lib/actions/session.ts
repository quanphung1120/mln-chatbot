"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongoose";
import SessionModel from "@/lib/models/Session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getSessions() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    await dbConnect();

    const sessions = await SessionModel.find({ userId })
      .select("_id title")
      .sort({ updatedAt: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s._id.toString(),
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

    await dbConnect();

    // Verify and delete the session
    const result = await SessionModel.deleteOne({ _id: sessionId, userId });

    if (result.deletedCount === 0) {
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

    await dbConnect();

    // Verify and update the session title
    const result = await SessionModel.updateOne(
      { _id: sessionId, userId },
      { title: newTitle.trim() }
    );

    if (result.matchedCount === 0) {
      throw new Error("Session not found or unauthorized");
    }
  } catch (error) {
    console.error("[renameSessionAction] Failed to rename session:", error);
    throw error;
  }

  revalidatePath("/dashboard");
}

