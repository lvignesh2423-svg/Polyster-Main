import { NextRequest } from "next/server";
import { generateCompletion, extractJSON } from "@/lib/ai";
import {
  buildQuestionGenerationPrompt,
  buildWeaknessAnalysisPrompt,
} from "@/lib/prompts";
import type {
  GitHubProfile,
  EnrichedRepo,
  Difficulty,
  RoleTarget,
  CompanyStyle,
  InterviewQuestion,
  WeaknessReport,
  StrengthHighlight,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { profile, repos, difficulty, role, companyStyle } = body as {
    profile: GitHubProfile;
    repos: EnrichedRepo[];
    difficulty: Difficulty;
    role: RoleTarget;
    companyStyle: CompanyStyle;
  };

  if (!profile || !repos?.length) {
    return Response.json(
      { error: "Profile and repos are required" },
      { status: 400 }
    );
  }

  try {
    const questionPrompt = buildQuestionGenerationPrompt(
      profile,
      repos,
      difficulty,
      role,
      companyStyle
    );

    const questionsRaw = await generateCompletion(
      "You are an expert technical interviewer. Return ONLY a valid JSON array. No markdown, no explanation, no thinking, no reasoning — just the raw JSON array.",
      questionPrompt,
      16384,
      0.7
    );

    const jsonStr = extractJSON(questionsRaw);
    let questions: InterviewQuestion[];
    try {
      questions = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Questions parse error:", e);
      console.error("Raw:", questionsRaw.slice(0, 500));
      questions = [];
    }

    const weaknessPrompt = buildWeaknessAnalysisPrompt(profile, repos);
    const analysisRaw = await generateCompletion(
      "You are a code quality analyst. Return ONLY a valid JSON object. No markdown, no explanation, no thinking — just the raw JSON.",
      weaknessPrompt,
      8192,
      0.3
    );

    const analysisJson = extractJSON(analysisRaw);
    let analysis: {
      weaknesses: WeaknessReport[];
      strengths: StrengthHighlight[];
    };
    try {
      analysis = JSON.parse(analysisJson);
    } catch {
      analysis = { weaknesses: [], strengths: [] };
    }

    return Response.json({
      questions,
      weaknesses: analysis.weaknesses || [],
      strengths: analysis.strengths || [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate questions";
    return Response.json({ error: message }, { status: 500 });
  }
}
