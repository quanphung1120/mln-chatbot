import { generateText, Output, type ModelMessage } from "ai";
import { z } from "zod";

import { openrouter, PIPELINE_MODEL } from "@/lib/openrouter";
import { searchDocumentation, type SearchResult } from "@/lib/vector-search";

// Loop bounds. These make termination deterministic and cap cost/latency.
const MAX_ROUNDS = 3;
const PER_ROUND_LIMIT = 6;
const MAX_TOTAL_CHUNKS = 10;
const GRADER_EXCERPTS = 8;
const EXCERPT_CHARS = 600;

export interface RetrieveWithFeedbackOptions {
  courseCode?: string;
  /** Conversation that led to the tool call; used to resolve follow-ups. */
  messages?: ModelMessage[];
}

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

/** Plain-text user/assistant turns from the model messages. */
function extractRecentContext(messages: ModelMessage[]): ChatTurn[] {
  const context: ChatTurn[] = [];

  for (const message of messages) {
    if (message.role !== "user" && message.role !== "assistant") continue;

    const text = typeof message.content === "string"
      ? message.content
      : message.content
          .map((part) => (part.type === "text" ? part.text : ""))
          .join(" ");

    const trimmed = text.trim();
    if (trimmed) {
      context.push({ role: message.role, text: trimmed });
    }
  }

  return context;
}

const REWRITE_SYSTEM = `
You are a query-optimization component for a semantic (vector) search engine over the official curriculum of three FPT University Marxist-Leninist courses:
- MLN111: Triết học Mác - Lênin / Marxist-Leninist Philosophy
- MLN122: Kinh tế chính trị Mác - Lênin / Marxist-Leninist Political Economy
- MLN131: Chủ nghĩa xã hội khoa học / Scientific Socialism

Your ONLY job is to rewrite the given query into the single best standalone retrieval query. You NEVER answer the question.

Rules:
- Resolve any follow-up references, pronouns, or ellipses using the recent conversation so the query stands entirely on its own.
- Make it keyword-rich: include the precise academic terminology and closely related synonyms a student would find in the course documents.
- Keep the language of the course material. The documents are primarily Vietnamese, so keep Vietnamese domain terms in Vietnamese. Do not translate a Vietnamese query into English.
- Stay tightly focused on the underlying information need. Do not broaden the topic or add unrelated concepts.
- Return one concise query on a single line, with no quotes, labels, or commentary.
`.trim();

/**
 * Rewrites a raw retrieval query into an optimized, standalone search query,
 * resolving follow-up references against the recent conversation. Falls back
 * to the original query on any failure so retrieval never breaks here.
 */
async function rewriteSearchQuery(rawQuery: string, context: ChatTurn[]): Promise<string> {
  try {
    const conversation = context
      .slice(-4)
      .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.text}`)
      .join("\n");

    const { output } = await generateText({
      model: openrouter(PIPELINE_MODEL),
      system: REWRITE_SYSTEM,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `${conversation ? `Recent conversation:\n${conversation}\n\n` : ""}Original search query: "${rawQuery}"\n\nRewrite it into the best possible standalone retrieval query.`,
        },
      ],
      output: Output.object({
        schema: z.object({
          searchQuery: z
            .string()
            .describe(
              "The optimized standalone retrieval query, in the same language as the source material (keep Vietnamese in Vietnamese).",
            ),
        }),
      }),
    });

    return output.searchQuery.trim() || rawQuery;
  } catch (err) {
    console.warn("[rag-loop] Query rewrite failed, using original query:", err);
    return rawQuery;
  }
}

const GRADER_SYSTEM = `
You are the retrieval grader for a RAG system answering FPT University students' questions about three Marxist-Leninist courses (MLN111 Triết học, MLN122 Kinh tế chính trị, MLN131 Chủ nghĩa xã hội khoa học).

You are given the student's question and the excerpts retrieved so far. Decide whether these excerpts collectively contain enough grounded information for a knowledgeable assistant to write a correct and reasonably complete answer.

Judgment rules:
- Mark it SUFFICIENT when the excerpts cover the core of what the question asks, even if not every minor detail is present. Do not demand exhaustive coverage.
- Mark it NOT sufficient only when there is a clear, important gap that a different search could realistically fill (e.g. a key sub-topic, definition, or example the question needs is entirely missing).
- When NOT sufficient, produce ONE refined, complementary search query that specifically targets the missing aspect — not a rephrasing of what already matched. Keep it in the language of the course material (Vietnamese domain terms stay in Vietnamese).
- When sufficient, return an empty refinedQuery.
- You never answer the question yourself.
`.trim();

interface GradeResult {
  sufficient: boolean;
  refinedQuery: string;
}

/**
 * Judges whether the accumulated excerpts can answer the question; if not,
 * proposes one complementary query targeting the gap. Fails open (sufficient)
 * so a grader outage never blocks answering with what we already have.
 */
async function gradeRetrieval(question: string, chunks: SearchResult[]): Promise<GradeResult> {
  try {
    const excerpts = chunks
      .slice(0, GRADER_EXCERPTS)
      .map((c, i) => `[${i + 1}] (${c.filename})\n${c.text.slice(0, EXCERPT_CHARS)}`)
      .join("\n\n");

    const { output } = await generateText({
      model: openrouter(PIPELINE_MODEL),
      system: GRADER_SYSTEM,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Student question:\n${question}\n\nRetrieved excerpts:\n${excerpts}`,
        },
      ],
      output: Output.object({
        schema: z.object({
          sufficient: z
            .boolean()
            .describe("True if the excerpts are enough to write a complete, grounded answer."),
          refinedQuery: z
            .string()
            .describe("A complementary search query targeting the missing information; empty string when sufficient."),
        }),
      }),
    });

    return {
      sufficient: output.sufficient,
      refinedQuery: output.refinedQuery.trim(),
    };
  } catch (err) {
    console.warn("[rag-loop] Grader failed, treating retrieval as sufficient:", err);
    return { sufficient: true, refinedQuery: "" };
  }
}

function rankChunks(dedupe: Map<string, SearchResult>): SearchResult[] {
  return [...dedupe.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * Corrective RAG retrieval loop.
 *
 * Round 1 searches with the rewritten query. After each round a cheap grader
 * model judges whether the accumulated context is sufficient; if not, it
 * proposes a refined query that targets the gap and the loop searches again,
 * accumulating and de-duplicating chunks. The loop always terminates — capped
 * by MAX_ROUNDS, by a repeated query, or by a round that surfaces nothing new —
 * and always returns whatever context it gathered so the caller can answer.
 */
export async function retrieveWithFeedback(
  rawQuery: string,
  options: RetrieveWithFeedbackOptions = {},
): Promise<SearchResult[]> {
  const { courseCode, messages = [] } = options;
  const context = extractRecentContext(messages);

  // Grade against the actual student question when we have it; the model's
  // tool query is only a proxy for the underlying information need.
  const question =
    [...context].reverse().find((m) => m.role === "user")?.text ?? rawQuery;

  const dedupe = new Map<string, SearchResult>();
  const queries: string[] = [];
  const seenQueries = new Set<string>();

  let nextQuery = await rewriteSearchQuery(rawQuery, context);
  let sufficient = false;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const normalized = nextQuery.trim().toLowerCase();
    // Stop on an empty or already-tried query to avoid spinning on the loop.
    if (!normalized || seenQueries.has(normalized)) break;
    seenQueries.add(normalized);
    queries.push(nextQuery);

    const sizeBefore = dedupe.size;
    try {
      const results = await searchDocumentation(nextQuery, PER_ROUND_LIMIT, courseCode);
      for (const result of results) {
        const key = `${result.filename}␟${result.text}`;
        if (!dedupe.has(key)) dedupe.set(key, result);
      }
    } catch (err) {
      console.error(`[rag-loop] Retrieval failed on round ${round}:`, err);
    }

    // Stop without grading when this was the final allowed round, when a
    // refined query surfaced nothing new (index exhausted for this line of
    // inquiry), or when there is nothing retrieved to grade a gap against.
    if (round === MAX_ROUNDS || (round > 1 && dedupe.size === sizeBefore) || dedupe.size === 0) {
      break;
    }

    const grade = await gradeRetrieval(question, rankChunks(dedupe));
    sufficient = grade.sufficient;
    if (grade.sufficient || !grade.refinedQuery) break;
    nextQuery = grade.refinedQuery;
  }

  console.info(
    `[rag-loop] ${queries.length} round(s), sufficient=${sufficient}, chunks=${dedupe.size}, queries=${JSON.stringify(queries)}`,
  );

  return rankChunks(dedupe).slice(0, MAX_TOTAL_CHUNKS);
}
