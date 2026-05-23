import { createOpenAI } from "@ai-sdk/openai";
import {
  consumeStream,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  zodSchema,
  type UIMessage,
} from "ai";
import {
  frontendTools,
  injectQuoteContext,
} from "@assistant-ui/react-ai-sdk";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import dbConnect from "@/lib/mongoose";
import SessionModel from "@/lib/models/Session";
import { searchDocumentation } from "@/lib/vector-search";

export const maxDuration = 60;

const DEFAULT_MODEL = "deepseek/deepseek-v4-flash";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://github.com/quanphung1120/mln-chatbot",
    "X-Title": "MLN Chatbot",
  },
});

const SYSTEM_PROMPT = `
You are MLN Assistant, a premium syllabus-aligned AI assistant for FPT University students studying Marxist-Leninist subjects.

Rules:
- For MLN111, MLN122, or MLN131 questions, call searchDocumentation first.
- Prioritize official retrieved course documentation.
- If no relevant documentation is found, clearly say that official course data was not found, then answer using secondary general knowledge.
- Answer in Vietnamese if the user asks in Vietnamese; otherwise answer in English.
- Use clear Markdown structure.
`.trim();

type FrontendToolsInput = Parameters<typeof frontendTools>[0];

type ChatRequestBody = {
  messages: UIMessage[];
  sessionId?: string;
  system?: string;
  tools?: FrontendToolsInput;
};

function getMessageText(message?: UIMessage): string {
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

function createTitleFromMessages(messages: UIMessage[]) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  const text = getMessageText(lastUserMessage) || "New Chat";
  return text.length > 50 ? `${text.slice(0, 50).trim()}...` : text;
}

async function getSessionId({
  sessionId,
  userId,
  messages,
}: {
  sessionId?: string;
  userId?: string | null;
  messages: UIMessage[];
}) {
  if (!sessionId || sessionId === "new") {
    const session = await SessionModel.create({
      userId: userId ?? undefined,
      title: createTitleFromMessages(messages),
      messages,
    });

    return session._id.toString();
  }

  const session = await SessionModel.findById(sessionId);

  if (!session) {
    throw new Response("Session not found", { status: 404 });
  }

  if (session.userId && session.userId !== userId) {
    throw new Response("Unauthorized access to session", { status: 403 });
  }

  await SessionModel.findByIdAndUpdate(sessionId, {
    $set: { messages },
  });

  return sessionId;
}

async function saveSessionMessages(sessionId: string, messages: UIMessage[]) {
  console.log("Message has been saved for session " + sessionId + ": ", JSON.stringify(messages));
  await SessionModel.findByIdAndUpdate(sessionId, {
    $set: { messages },
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
    }

    const { userId } = await auth();
    const body = (await req.json()) as ChatRequestBody;

    const { messages, sessionId, system, tools } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Missing or invalid messages", { status: 400 });
    }

    await dbConnect();

    const activeSessionId = await getSessionId({
      sessionId,
      userId,
      messages,
    });

    const result = streamText({
      model: openrouter(DEFAULT_MODEL),
      system: [SYSTEM_PROMPT, system].filter(Boolean).join("\n\n"),
      messages: await convertToModelMessages(injectQuoteContext(messages)),
      stopWhen: stepCountIs(5),
      tools: {
        ...(tools ? frontendTools(tools) : {}),

        searchDocumentation: tool({
          description:
            "Search official Marxist-Leninist course documentation and syllabus segments.",
          inputSchema: zodSchema(
            z.object({
              query: z
                .string()
                .min(1)
                .describe("Semantic search query for course documentation."),
            }),
          ),
          execute: async ({ query }) => {
            const results = await searchDocumentation(query, 6);

            if (!results.length) {
              return {
                message: "No relevant official documentation found.",
                results: [],
              };
            }

            return {
              message: `Retrieved ${results.length} relevant syllabus segments.`,
              results,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: consumeStream,
      headers: {
        "X-Session-Id": activeSessionId,
        "Access-Control-Expose-Headers": "X-Session-Id",
      },
      onFinish: async ({ messages: finishedMessages }) => {
        await saveSessionMessages(activeSessionId, finishedMessages);
      },
      onError: (error) => {
        console.error("[API/Chat] Stream error:", error);
        return "An error occurred while generating the response.";
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error("[API/Chat] Critical error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}