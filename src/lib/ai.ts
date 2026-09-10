import OpenAI from "openai";

const BASE_URL = "https://openrouter.ai/api/v1";
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

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
  return response.choices[0]?.message?.content || "";
}

export async function generateCompletionStream(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096,
  temperature = 0.7
): Promise<ReadableStream<string>> {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) controller.enqueue(content);
        }
      } finally {
        controller.close();
      }
    },
  });
}

export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens = 2048,
  temperature = 0.7
): Promise<string> {
  const openai = getClient();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0]?.message?.content || "";
}
