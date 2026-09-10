import OpenAI from "openai";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
    client = new OpenAI({
      apiKey,
      baseURL: NVIDIA_BASE_URL,
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
    model: NVIDIA_MODEL,
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
    model: NVIDIA_MODEL,
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
    model: NVIDIA_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0]?.message?.content || "";
}
