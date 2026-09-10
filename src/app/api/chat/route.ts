import { NextRequest } from "next/server";
import { chatCompletion } from "@/lib/ai";
import { buildChatSystemPrompt } from "@/lib/prompts";
import type { GitHubProfile, EnrichedRepo, ChatMessage } from "@/lib/types";

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
          "This is a practice session. The user will answer your questions. Grade their answers, give feedback, and move to the next topic. Be encouraging but honest about weaknesses.",
      });
    } else if (mode === "mock") {
      apiMessages.splice(1, 0, {
        role: "system" as const,
        content:
          "This is a timed mock interview. Ask one question at a time. Be professional and structured like a real FAANG interview. After each answer, give brief feedback and move to the next question. After 10 questions, provide a final score.",
      });
    }

    const response = await chatCompletion(apiMessages, 2048, 0.7);

    return Response.json({ response });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    return Response.json({ error: message }, { status: 500 });
  }
}
