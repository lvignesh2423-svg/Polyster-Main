import { NextRequest } from "next/server";
import { chatCompletion } from "@/lib/ai";
import { buildChatSystemPrompt } from "@/lib/prompts";
import type { GitHubProfile, EnrichedRepo, ChatMessage } from "@/lib/types";

function stripReasoning(text: string): string {
  let cleaned = text;

  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");

  const lines = cleaned.split("\n");
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("Here's a thinking process") ||
      trimmed.startsWith("Here's my thinking") ||
      trimmed.startsWith("Let me think") ||
      trimmed.startsWith("**Step") ||
      trimmed.match(/^\d+\.\s+\*\*Analyze/) ||
      trimmed.match(/^\d+\.\s+\*\*Identify/) ||
      trimmed.match(/^\d+\.\s+\*\*Determine/) ||
      trimmed.match(/^\d+\.\s+\*\*Draft/)
    ) {
      continue;
    }
    result.push(line);
  }
  return result.join("\n").trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profile, repos, messages, mode } = body as {
    profile: GitHubProfile;
    repos: EnrichedRepo[];
    messages: ChatMessage[];
    mode: "qa" | "practice" | "mock";
  };

  if (!messages?.length) {
    return Response.json({ error: "Messages are required" }, { status: 400 });
  }

  try {
    const systemPrompt = buildChatSystemPrompt(profile, repos);

    const apiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map(
        (m) => ({ role: m.role as "user" | "assistant", content: m.content })
      ),
    ];

    if (mode === "practice") {
      apiMessages.splice(1, 0, {
        role: "system" as const,
        content:
          "This is a practice session. The user will answer your questions. Grade their answers, give feedback, and move to the next topic. Be encouraging but honest about weaknesses. Do not show your thinking process — just give the final answer.",
      });
    } else if (mode === "mock") {
      apiMessages.splice(1, 0, {
        role: "system" as const,
        content:
          "This is a timed mock interview. Ask one question at a time. Be professional and structured like a real FAANG interview. After each answer, give brief feedback and move to the next question. After 10 questions, provide a final score. Do not show your thinking process — just give the final answer.",
      });
    }

    const raw = await chatCompletion(apiMessages, 4096, 0.7);
    const response = stripReasoning(raw);

    return Response.json({ response: response || "I apologize, please try again." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    return Response.json({ error: message }, { status: 500 });
  }
}
