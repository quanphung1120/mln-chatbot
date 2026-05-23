"use server";

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongoose";
import SessionModel from "@/lib/models/Session";

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
