import { auth } from "@clerk/nextjs/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { searchDocumentation } from "@/lib/vector-search";
import { getCourse } from "@/lib/courses";
import { getBank } from "@/features/quiz/data";

export const runtime = "nodejs";
export const maxDuration = 30;

const EXPLAIN_MODEL = "tencent/hy3-preview";

// Only identifiers are trusted from the client; the question text/options/answer
// are loaded from the authoritative bank server-side (avoids cache poisoning).
const bodySchema = z.object({
  courseCode: z.string().min(2).max(16),
  questionId: z.number().int(),
});

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://github.com/quanphung1120/mln-chatbot",
    "X-Title": "MLN Chatbot",
  },
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
    }

    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response("Invalid request", { status: 400 });
    }
    const { courseCode, questionId } = parsed.data;

    // Resolve the question from the real bank — never trust client-supplied text.
    const question = getBank(courseCode).find((q) => q.id === questionId);
    if (!question) {
      return new Response("Question not found", { status: 404 });
    }
    const { question: questionText, options, answer } = question;
    const correctText = options[answer] ?? "";

    // 1) Serve from cache if we've explained this question before.
    const cached = await prisma.quizExplanation.findUnique({
      where: { courseCode_questionId: { courseCode, questionId } },
    });
    if (cached) {
      return Response.json({ content: cached.content, cached: true });
    }

    // 2) Retrieve course-scoped context from the RAG knowledge base.
    let context = "";
    try {
      const results = await searchDocumentation(questionText, 5, courseCode);
      context = results
        .map((r) => `[${r.filename}] ${r.text}`)
        .join("\n\n")
        .slice(0, 6000);
    } catch (err) {
      console.error("[quiz/explain] retrieval failed:", err);
    }

    const course = getCourse(courseCode);
    const optionsText = options
      .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
      .join("\n");

    const system = `Bạn là trợ giảng môn ${course?.title ?? courseCode} (${courseCode}). Giải thích ngắn gọn, chính xác bằng tiếng Việt vì sao đáp án đúng là đúng và (nếu cần) vì sao các đáp án khác sai. Ưu tiên dùng ngữ cảnh giáo trình được cung cấp; nếu có, hãy trích nguồn theo dạng [Nguồn: filename]. Nếu không có ngữ cảnh, dùng kiến thức chuẩn xác của môn học. Trả lời tối đa khoảng 120 từ.`;

    const prompt = `Câu hỏi: ${questionText}\n\nCác lựa chọn:\n${optionsText}\n\nĐáp án đúng: ${String.fromCharCode(65 + answer)}. ${correctText}\n\n${
      context ? `Ngữ cảnh giáo trình:\n${context}` : "(Không tìm thấy ngữ cảnh giáo trình.)"
    }\n\nHãy giải thích.`;

    const { text } = await generateText({
      model: openrouter(EXPLAIN_MODEL),
      system,
      prompt,
      temperature: 0.2,
    });

    const content = text.trim();

    // 3) Cache the explanation (best-effort).
    try {
      await prisma.quizExplanation.create({
        data: { courseCode, questionId, content },
      });
    } catch (err) {
      // unique-violation on concurrent requests is fine; ignore.
      console.warn("[quiz/explain] cache write skipped:", err);
    }

    return Response.json({ content, cached: false });
  } catch (error) {
    console.error("[quiz/explain] error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
