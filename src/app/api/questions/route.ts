import { NextRequest } from "next/server";
import { generateCompletion } from "@/lib/ai";
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
      "You are an expert technical interviewer. Return only valid JSON.",
      questionPrompt,
      8192,
      0.7
    );

    const cleanedQuestions = questionsRaw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let questions: InterviewQuestion[];
    try {
      questions = JSON.parse(cleanedQuestions);
    } catch {
      const arrayMatch = cleanedQuestions.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        questions = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error("Could not parse questions JSON");
      }
    }

    const weaknessPrompt = buildWeaknessAnalysisPrompt(profile, repos);
    const analysisRaw = await generateCompletion(
      "You are a code quality analyst. Return only valid JSON.",
      weaknessPrompt,
      4096,
      0.3
    );

    const cleanedAnalysis = analysisRaw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let analysis: {
      weaknesses: WeaknessReport[];
      strengths: StrengthHighlight[];
    };
    try {
      analysis = JSON.parse(cleanedAnalysis);
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
