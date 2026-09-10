import { NextRequest } from "next/server";
import {
  fetchProfile,
  fetchRepos,
  fetchRepoLanguages,
  fetchRepoFiles,
  fetchReadme,
  fetchCommits,
  rankRepos,
  analyzeWeaknesses,
} from "@/lib/github";
import type { EnrichedRepo } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { input } = body;
  const token = process.env.GITHUB_TOKEN || body.token;

  if (!input) {
    return Response.json({ error: "Input is required" }, { status: 400 });
  }

  try {
    const profile = await fetchProfile(input, token);
    const basicRepos = await fetchRepos(profile.login, token);

    const enrichedRepos: EnrichedRepo[] = [];
    const topRepos = basicRepos.slice(0, 15);

    for (const repo of topRepos) {
      const [languages, files, readme, commits] = await Promise.all([
        fetchRepoLanguages(repo.full_name, token),
        fetchRepoFiles(repo.full_name, token),
        fetchReadme(repo.full_name, token),
        fetchCommits(repo.full_name, token, 20),
      ]);

      const enriched: EnrichedRepo = {
        ...repo,
        languages,
        files,
        readme,
        commits,
        interviewRelevance: 0,
        weaknessFlags: [],
        strengths: [],
      };

      analyzeWeaknesses(enriched);
      enrichedRepos.push(enriched);
    }

    const ranked = rankRepos(enrichedRepos);

    return Response.json({ profile, repos: ranked });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch GitHub data";
    return Response.json({ error: message }, { status: 500 });
  }
}
