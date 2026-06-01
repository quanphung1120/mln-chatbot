import { injectQuoteContext } from "@assistant-ui/react-ai-sdk";
import { auth } from "@clerk/nextjs/server";
import { createOpenAI } from "@ai-sdk/openai";
import {
    consumeStream,
    convertToModelMessages,
    generateText,
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
You are MLN Assistant, a premium syllabus-aligned AI assistant for FPT University students studying Marxist-Leninist subjects (MLN111: Marxist-Leninist Philosophy, MLN122: Marxist-Leninist Political Economy, MLN131: Scientific Socialism).

GUIDELINES & MANDATORY TOOL USAGE:
1. When asked about content, study knowledge, or syllabuses of Marxist-Leninist courses (MLN111, MLN122, MLN131), you MUST invoke the \`searchDocumentation\` tool first to retrieve official curriculum information from the database.
2. STICK TO TOOL RESULTS:
   - You must prioritize official curriculum context returned from the \`searchDocumentation\` tool. Do not hallucinate, make assumptions, or rely on general knowledge if the official curriculum documentation provides the answer.
   - You must explicitly cite the document source using the \`filename\` field returned by the tool at either the beginning or end of your answer (e.g., "[Source: MLN111_Syllabus.txt]").
3. HANDLING UNRETRIEVED INFORMATION:
   - If the \`searchDocumentation\` tool does not return matching records, or the returned context is insufficient to answer, you must state clearly: "Official course data was not found in the curriculum database."
   - Only after stating this can you answer the query using your highly accurate general knowledge of the subject as a secondary reference.
4. LANGUAGE & FORMATTING:
   - Answer in Vietnamese if the user asks in Vietnamese; otherwise, answer in English.
   - Use professional, well-structured Markdown formatting (clear headings, bullet points, and bold text for key terms).
`.trim();

const tools = {
    searchDocumentation: tool({
        description: "Search for official Marxist-Leninist curriculum documents matching the query or keywords.",
        inputSchema: z.object({
            query: z.string().describe("The search query or keywords to lookup in the official curriculum database."),
        }),
        execute: async ({ query }) => {
            try {
                const results = await searchDocumentation(query, 6);
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

const ENABLE_CHAT_PERSISTENCE_DEBUG =
    process.env.NODE_ENV !== "production" || process.env.DEBUG_CHAT_PERSISTENCE === "1";

function debugChatPersistence(message: string, data: Record<string, unknown>) {
    if (!ENABLE_CHAT_PERSISTENCE_DEBUG) return;
    console.debug(`[API/Chat][Persist] ${message}`, data);
}

function mergeWithStoredMessages(storedMessages: unknown, incomingMessages: ChatUIMessage[]) {
    if (!Array.isArray(storedMessages) || storedMessages.length === 0) {
        return incomingMessages;
    }

    const previousMessages = storedMessages as ChatUIMessage[];
    const incomingLooksComplete =
        incomingMessages.length >= previousMessages.length &&
        previousMessages.every((message, index) => message.id === incomingMessages[index]?.id);

    if (incomingLooksComplete) {
        return incomingMessages;
    }

    const previousIds = new Set(previousMessages.map((message) => message.id).filter(Boolean));
    const unseenIncomingMessages = incomingMessages.filter((message) => !previousIds.has(message.id));

    return [...previousMessages, ...unseenIncomingMessages];
}

function toMessageArray(messages: unknown): ChatUIMessage[] {
    if (!Array.isArray(messages)) return [];
    return messages as ChatUIMessage[];
}

function hashString(value: string): string {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = Math.imul(31, hash) + value.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash).toString(36);
}

function ensureMessageIds(messages: ChatUIMessage[], sessionId: string) {
    return messages.map((message, index) => {
        if (message.id && message.id.trim().length > 0) {
            return message;
        }

        const fingerprint = hashString(`${sessionId}:${index}:${message.role}:${getMessageText(message)}`);

        return {
            ...message,
            id: `${message.role}-${index}-${fingerprint}`,
        };
    });
}

function getMessageIdentity(message: ChatUIMessage, index: number): string {
    if (message.id) return `id:${message.id}`;
    return `fallback:${message.role}:${getMessageText(message)}:${index}`;
}

function mergeMessageSets(...sets: ChatUIMessage[][]): ChatUIMessage[] {
    const merged: ChatUIMessage[] = [];
    const seen = new Set<string>();

    for (const set of sets) {
        set.forEach((message, index) => {
            const identity = getMessageIdentity(message, index);
            if (seen.has(identity)) return;
            seen.add(identity);
            merged.push(message);
        });
    }

    return merged;
}

function getMessageText(message?: ChatUIMessage): string {
    if (!message?.parts) return "";

    return message.parts
        .map((part) => {
            if (part.type === "text") return part.text;
            return "";
        })
        .filter(Boolean)
        .join("\n")
        .trim();
}

async function generateTitle(messages: ChatUIMessage[]): Promise<string> {
    const firstUserMessage = messages.find((m) => m.role === "user");
    const userText = getMessageText(firstUserMessage);

    if (!userText) return "New Chat";

    try {
        const { text } = await generateText({
            model: openrouter(DEFAULT_MODEL),
            prompt: [
                "Generate a concise chat title (max 60 characters, no quotes) for this user message:",
                `"${userText.slice(0, 400)}"`,
                "Reply with only the title text, nothing else.",
            ].join("\n"),
            maxOutputTokens: 30,
        });

        const generated = text.trim().replace(/^["']|["']$/g, "");
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
        const body = (await req.json()) as ChatRequestBody;
        const incomingMessages = Array.isArray(body.messages)
            ? body.messages
            : body.message
                ? [body.message]
                : [];
        const sessionId = body.sessionId ?? body.id;

        debugChatPersistence("Incoming payload", {
            hasMessage: Boolean(body.message),
            messagesLength: Array.isArray(body.messages) ? body.messages.length : 0,
            hasId: Boolean(body.id),
            hasSessionId: Boolean(body.sessionId),
            resolvedSessionId: sessionId ?? null,
            incomingMessagesLength: incomingMessages.length,
        });

        if (incomingMessages.length === 0) {
            return new Response("Missing or invalid message", { status: 400 });
        }

        const isNewSession = !sessionId || sessionId === "new";
        let activeMessages: ChatUIMessage[] = incomingMessages;
        let activeSessionId: string;

        if (isNewSession) {
            const session = await prisma.chatSession.create({
                data: {
                    userId: userId ?? undefined,
                    title: "Generating title...",
                    messages: activeMessages as unknown as Prisma.InputJsonValue,
                },
            });

            activeSessionId = session.id;
            activeMessages = ensureMessageIds(activeMessages, activeSessionId);

            await prisma.chatSession.update({
                where: { id: activeSessionId },
                data: { messages: activeMessages as unknown as Prisma.InputJsonValue },
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

            activeMessages = ensureMessageIds(
                mergeWithStoredMessages(session.messages, incomingMessages),
                activeSessionId,
            );

            await prisma.chatSession.update({
                where: { id: activeSessionId },
                data: { messages: activeMessages as unknown as Prisma.InputJsonValue },
            });
        }

        debugChatPersistence("Active messages before stream", {
            sessionId: activeSessionId,
            activeMessagesLength: activeMessages.length,
            isNewSession,
        });

        const validatedMessages = await validateUIMessages<ChatUIMessage>({
            messages: activeMessages,
            tools,
        });

        const modelMessages = await convertToModelMessages(injectQuoteContext(validatedMessages), {
            ignoreIncompleteToolCalls: true,
        });
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

                    const latestMessages = ensureMessageIds(toMessageArray(latestSession?.messages), activeSessionId);
                    const finished = ensureMessageIds(toMessageArray(finishedMessages), activeSessionId);
                    const mergedMessages = ensureMessageIds(
                        mergeMessageSets(latestMessages, activeMessages, finished),
                        activeSessionId,
                    );

                    const finishedLooksIncomplete =
                        finished.length > 0 &&
                        (finished.length < activeMessages.length ||
                            !activeMessages.every((message) =>
                                message.id ? finished.some((candidate) => candidate.id === message.id) : true,
                            ));

                    debugChatPersistence("Finish merge stats", {
                        sessionId: activeSessionId,
                        finishedMessagesLength: finished.length,
                        latestMessagesLength: latestMessages.length,
                        activeMessagesLength: activeMessages.length,
                        mergedMessagesLength: mergedMessages.length,
                        finishedLooksIncomplete,
                    });

                    await prisma.chatSession.update({
                        where: { id: activeSessionId },
                        data: {
                            messages: mergedMessages as unknown as Prisma.InputJsonValue,
                            ...(isNewSession ? { title: await generateTitle(validatedMessages) } : {}),
                        },
                    });

                    const verifySession = await prisma.chatSession.findUnique({
                        where: { id: activeSessionId },
                        select: { messages: true },
                    });

                    debugChatPersistence("Post-update verification", {
                        sessionId: activeSessionId,
                        persistedMessagesLength: toMessageArray(verifySession?.messages).length,
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
