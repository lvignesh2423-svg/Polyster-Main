import { NextRequest } from "next/server";
import { chatCompletion, stripMarkdown } from "@/lib/ai";
import { buildChatSystemPrompt, buildMockInterviewPrompt } from "@/lib/prompts";
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
    const baseSystemPrompt = mode === "mock"
      ? buildMockInterviewPrompt(profile, repos, "mid")
      : buildChatSystemPrompt(profile, repos);

    const apiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: baseSystemPrompt },
    ];

    if (mode === "practice") {
      apiMessages.push({
        role: "system",
        content:
          "This is a practice session. The user will answer your questions. Grade their answers, give feedback, and move to the next topic. Be encouraging but honest about weaknesses.",
      });
    } else if (mode === "mock") {
      apiMessages.push({
        role: "system",
        content:
          "You are conducting a timed mock interview. Ask ONE question at a time. After each answer, give brief feedback then ask the next question. Count questions. After 10 questions, provide a final score and summary.",
      });
    }

    for (const m of messages) {
      apiMessages.push({
        role: m.role as "user" | "assistant",
        content: m.content,
      });
    }

    const raw = await chatCompletion(apiMessages, 8192, 0.7);
    const response = stripMarkdown(raw);

    return Response.json({ response: response || "I apologize, please try again." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response";
    return Response.json({ error: message }, { status: 500 });
  }
}
