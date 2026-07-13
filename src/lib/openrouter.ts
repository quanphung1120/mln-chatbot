import { createOpenAI } from "@ai-sdk/openai";

/**
 * Shared OpenRouter provider used by every LLM/embedding call in the app
 * (chat answers, retrieval helpers, titles, quiz explanations, embeddings).
 */
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  headers: {
    "HTTP-Referer": "https://github.com/quanphung1120/mln-chatbot",
    "X-Title": "MLN Chatbot",
  },
});

// Fast, cheap model for internal pipeline calls (query rewriting, retrieval
// grading, chat titles) — never used to write user-facing answers.
export const PIPELINE_MODEL = "qwen/qwen3-next-80b-a3b-instruct";
