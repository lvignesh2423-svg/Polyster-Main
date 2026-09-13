import OpenAI from "openai";

const BASE_URL = "https://openrouter.ai/api/v1";
const MODEL = "inclusionai/ling-3.0-flash-sante:free";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set. Get a free key at https://openrouter.ai");
    client = new OpenAI({
      apiKey,
      baseURL: BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://repo-interview-ai.local",
        "X-Title": "RepoInterview AI",
      },
    });
  }
  return client;
}

export function stripMarkdown(text: string): string {
  let s = text;
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
  s = s.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/_([^_]+)_/g, "$1");
  s = s.replace(/~~([^~]+)~~/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/```[\s\S]*?```/g, "");
  s = s.replace(/^\s*[-*+]\s+/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/^\s*>\s+/gm, "");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
  s = s.replace(/---+/g, "");
  s = s.replace(/\|[^|]+\|/g, "");
  s = s.replace(/^\s*[-=]{3,}\s*$/gm, "");
  const lines = s.split("\n");
  const cleaned: string[] = [];
  let prevEmpty = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (!prevEmpty) cleaned.push("");
      prevEmpty = true;
    } else {
      cleaned.push(trimmed);
      prevEmpty = false;
    }
  }
  return cleaned.join("\n").trim();
}

export function extractJSON(raw: string): string {
  let cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {}

  function findMatching(str: string, start: number, open: string, close: string): string | null {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < str.length; i++) {
      const ch = str[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === open) depth++;
      if (ch === close) depth--;
      if (depth === 0) {
        return str.slice(start, i + 1);
      }
    }
    return null;
  }

  const arrayStart = cleaned.indexOf("[");
  const objectStart = cleaned.indexOf("{");

  const startIdx = arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)
    ? arrayStart
    : objectStart;

  if (startIdx === -1) return "[]";

  const open = cleaned[startIdx] === "[" ? "[" : "{";
  const close = open === "[" ? "]" : "}";
  const candidate = findMatching(cleaned, startIdx, open, close);
  if (candidate) {
    try { JSON.parse(candidate); return candidate; } catch {}
  }

  return open === "[" ? "[]" : "{}";
}

function extractContent(response: { choices: { message: { content: string | null; reasoning?: string | null } }[] }): string {
  const msg = response.choices[0]?.message;
  if (msg?.content) return msg.content;
  if (msg?.reasoning) return msg.reasoning;
  return "";
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096,
  temperature = 0.7
): Promise<string> {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });
  return extractContent(response);
}

export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens = 4096,
  temperature = 0.7
): Promise<string> {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  });
  return extractContent(response);
}
