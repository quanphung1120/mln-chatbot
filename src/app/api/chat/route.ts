import { injectQuoteContext } from "@assistant-ui/react-ai-sdk";
import { auth } from "@clerk/nextjs/server";
import { createOpenAI } from "@ai-sdk/openai";
import {
    consumeStream,
    convertToModelMessages,
    generateText,
    Output,
    stepCountIs,
    streamText,
    tool,
    validateUIMessages,
    type InferUITools,
    type ToolSet,
    type UIDataTypes,
    type UIMessage,
} from "ai";
import { z } from "zod";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/db";
import { searchDocumentation } from "@/lib/vector-search";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MODEL = "tencent/hy3-preview";
const SESSION_ID_HEADER = "X-Session-Id";

const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
        "HTTP-Referer": "https://github.com/quanphung1120/mln-chatbot",
        "X-Title": "MLN Chatbot",
    },
});

const SYSTEM_PROMPT = `
You are MLN Assistant, a premium syllabus-aligned AI assistant for FPT University students studying Marxist-Leninist subjects:
- MLN111: Triết học Mác - Lênin / Marxist-Leninist Philosophy
- MLN122: Kinh tế chính trị Mác - Lênin / Marxist-Leninist Political Economy
- MLN131: Chủ nghĩa xã hội khoa học / Scientific Socialism

GUIDELINES & MANDATORY TOOL USAGE:
1. MANDATORY TOOL CALL: When the user asks ANY question about course content, syllabus topics, study concepts, or academic knowledge of Marxist-Leninist subjects in either English or Vietnamese, you MUST ALWAYS invoke the \`searchDocumentation\` tool first.
2. CRITICAL DIRECTIVE: You are STRICTLY PROHIBITED from answering any conceptual, course, or subject-related question using your own general knowledge without first invoking the \`searchDocumentation\` tool. You MUST invoke it on every single turn when subject questions are asked, even for basic, definition, or general questions (e.g. "Triết học Mác-Lênin là gì", "Quy luật", "Ý thức", "Vật chất", "Giá trị thặng dư").
3. STICK TO TOOL RESULTS:
   - You must prioritize official curriculum context returned from the \`searchDocumentation\` tool. Do not hallucinate, make assumptions, or rely on general knowledge if the official curriculum documentation provides the answer.
   - You must explicitly cite the document source using the \`filename\` field returned by the tool at either the beginning or end of your answer (e.g., "[Source: MLN111_Syllabus.txt]").
4. MANDATORY CONCLUSION & ANSWER SYNTHESIS:
   - After retrieving the curriculum data from the tool, you MUST synthesize a clear, comprehensive, and cohesive answer that directly answers the user's specific question.
   - You are STRICTLY REQUIRED to formulate a clear, distinct concluding paragraph or summary section at the very end of your response (e.g., labeled as "Kết luận" or "Tóm tắt lại") that acts as a final answer to their question.
5. HANDLING UNRETRIEVED INFORMATION:
   - If the \`searchDocumentation\` tool does not return matching records, or the returned context is insufficient to answer, you must state clearly: "Official course data was not found in the curriculum database."
   - Only after stating this can you answer the query using your highly accurate general knowledge of the subject as a secondary reference, while still providing a clear final concluding answer.
6. LANGUAGE & FORMATTING:
   - Answer in Vietnamese if the user asks in Vietnamese; otherwise, answer in English.
   - Use professional, well-structured Markdown formatting (clear headings, bullet points, and bold text for key terms).
`.trim();

const tools = {
    searchDocumentation: tool({
        description: "CRITICAL: Call this tool for ANY question, concept, syllabus topic, or query about Marxist-Leninist subjects (MLN111, MLN122, MLN131, Philosophy, Triết học, Kinh tế chính trị, Chủ nghĩa xã hội). You must call this tool first before answering. Pass `courseCode` to narrow retrieval to a single course's materials when the question is clearly about one course.",
        inputSchema: z.object({
            query: z.string().describe("The search query, concept, or keywords in English or Vietnamese to search in the official database."),
            courseCode: z.enum(["MLN111", "MLN122", "MLN131"]).optional().describe("Optional course code to restrict retrieval to a single subject's documents."),
        }),
        execute: async ({ query, courseCode }) => {
            try {
                const results = await searchDocumentation(query, 6, courseCode);
                return results.map((result) => ({
                    filename: result.filename,
                    text: result.text,
                    score: Math.round((result.score ?? 1) * 100) + "%",
                }));
            } catch (err) {
                console.error("[Tool: searchDocumentation] Failed:", err);
                return [];
            }
        },
    }),
} satisfies ToolSet;

type ChatUITools = InferUITools<typeof tools>;
type ChatUIMessage = UIMessage<never, UIDataTypes, ChatUITools>;

type ChatRequestBody = {
    message?: ChatUIMessage;
    messages?: ChatUIMessage[];
    id?: string;
    sessionId?: string;
    system?: string;
};

/**
 * Ensures all messages have proper IDs and guarantees that the parts array
 * is never empty to prevent Zod validation failures on the server.
 */
function sanitizeMessages(messages: ChatUIMessage[], sessionId: string): ChatUIMessage[] {
    return messages.map((msg, index) => ({
        ...msg,
        id: msg.id || `${msg.role}-${index}-${sessionId}`,
        parts: msg.parts && msg.parts.length > 0
            ? msg.parts
            : [{ type: "text" as const, text: "" }],
    }));
}

/**
 * Cheap, synchronous title derived from the first user message. Used as the
 * session's initial title so the sidebar shows a meaningful name immediately,
 * before the async LLM-generated title (generateTitle) refines it.
 */
function deriveTitle(messages: ChatUIMessage[]): string {
    const firstUserMessage = messages.find((m) => m.role === "user");
    const userText = firstUserMessage?.parts
        ?.map((p) => (p.type === "text" ? p.text : ""))
        .join("")
        .trim();

    if (!userText) return "New Chat";
    return userText.length > 50 ? `${userText.slice(0, 50).trim()}...` : userText;
}

/**
 * Generates a descriptive title from the first user message.
 */
async function generateTitle(messages: ChatUIMessage[]): Promise<string> {
    const firstUserMessage = messages.find((m) => m.role === "user");
    const userText = firstUserMessage?.parts
        ?.map((p) => (p.type === "text" ? p.text : ""))
        .join("")
        .trim();

    if (!userText) return "New Chat";

    try {
        const { output } = await generateText({
            model: openrouter("google/gemini-2.5-flash"),
            system: "You are a helpful assistant. Reply with a JSON object containing a concise chat title.",
            messages: [
                {
                    role: "user",
                    content: `Generate a concise chat title (max 60 characters, no quotes) for this user message: "${userText.slice(0, 400)}"`,
                }
            ],
            output: Output.object({
                schema: z.object({
                    title: z.string().describe("A concise chat title, max 60 characters, no quotes"),
                }),
            }),
        });

        const generated = output.title.trim().replace(/^["']|["']$/g, "");
        if (generated.length > 0 && generated.length <= 120) {
            return generated.length > 60 ? `${generated.slice(0, 60).trim()}...` : generated;
        }
        return userText.length > 50 ? `${userText.slice(0, 50).trim()}...` : userText;
    } catch (err) {
        console.warn("[generateTitle] LLM title generation failed, using fallback:", err);
        return userText.length > 50 ? `${userText.slice(0, 50).trim()}...` : userText;
    }
}

export async function POST(req: Request) {
    try {
        if (!process.env.OPENROUTER_API_KEY) {
            return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
        }

        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = (await req.json()) as ChatRequestBody;
        const incomingMessages = Array.isArray(body.messages)
            ? body.messages
            : body.message
                ? [body.message]
                : [];
        const sessionId = body.sessionId ?? body.id;

        if (incomingMessages.length === 0) {
            return new Response("Missing or invalid message", { status: 400 });
        }

        const isNewSession = !sessionId || sessionId === "new";
        let activeSessionId: string;
        let activeMessages: ChatUIMessage[];

        if (isNewSession) {
            activeSessionId = randomUUID();
            activeMessages = sanitizeMessages(incomingMessages, activeSessionId);

            await prisma.chatSession.create({
                data: {
                    id: activeSessionId,
                    userId: userId ?? undefined,
                    title: deriveTitle(activeMessages),
                    messages: activeMessages as unknown as Prisma.InputJsonValue,
                },
            });
        } else {
            activeSessionId = sessionId;
            const session = await prisma.chatSession.findUnique({
                where: { id: activeSessionId },
            });

            if (!session) {
                return new Response("Session not found", { status: 404 });
            }

            if (session.userId && session.userId !== userId) {
                return new Response("Unauthorized access to session", { status: 403 });
            }

            const storedMessages = sanitizeMessages((session.messages || []) as unknown as ChatUIMessage[], activeSessionId);
            const storedIds = new Set(storedMessages.map((m) => m.id).filter(Boolean));
            const unseenIncoming = incomingMessages.filter((m) => !storedIds.has(m.id));

            activeMessages = sanitizeMessages([...storedMessages, ...unseenIncoming], activeSessionId);

            await prisma.chatSession.update({
                where: { id: activeSessionId },
                data: {
                    messages: activeMessages as unknown as Prisma.InputJsonValue,
                },
            });
        }

        const validatedMessages = await validateUIMessages<ChatUIMessage>({
            messages: activeMessages,
            tools,
        });

        const modelMessages = await convertToModelMessages(
            injectQuoteContext(validatedMessages),
            { ignoreIncompleteToolCalls: true }
        );

        const result = streamText({
            model: openrouter(DEFAULT_MODEL),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            temperature: 0.1,
            stopWhen: stepCountIs(5),
            tools,
            abortSignal: req.signal,
        });

        return result.toUIMessageStreamResponse({
            originalMessages: validatedMessages,
            consumeSseStream: consumeStream,
            sendReasoning: true,
            headers: {
                [SESSION_ID_HEADER]: activeSessionId,
                "Access-Control-Expose-Headers": SESSION_ID_HEADER,
            },
            onFinish: async ({ messages: finishedMessages }) => {
                try {
                    const latestSession = await prisma.chatSession.findUnique({
                        where: { id: activeSessionId },
                        select: { messages: true },
                    });

                    const latestMessages = sanitizeMessages(
                        (latestSession?.messages || []) as unknown as ChatUIMessage[],
                        activeSessionId
                    );
                    const latestIds = new Set(latestMessages.map((m) => m.id).filter(Boolean));
                    const unseenFinished = finishedMessages.filter((m) => !latestIds.has(m.id));

                    const finalMessages = sanitizeMessages(
                        [...latestMessages, ...unseenFinished],
                        activeSessionId
                    );

                    await prisma.chatSession.update({
                        where: { id: activeSessionId },
                        data: {
                            messages: finalMessages as unknown as Prisma.InputJsonValue,
                            ...(isNewSession ? { title: await generateTitle(finalMessages) } : {}),
                        },
                    });
                } catch (err) {
                    console.error("[API/Chat] Failed to persist finished messages:", err);
                }
            },
        });
    } catch (error) {
        if (error instanceof Response) return error;

        console.error("[API/Chat] Critical error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
