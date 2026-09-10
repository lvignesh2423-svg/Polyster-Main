import type {
  Difficulty,
  RoleTarget,
  CompanyStyle,
  EnrichedRepo,
  GitHubProfile,
  QuestionCategory,
} from "./types";

const DIFFERENCE_INSTRUCTIONS: Record<Difficulty, string> = {
  junior:
    "Focus on fundamentals, learning ability, and basic code comprehension. Keep technical depth moderate.",
  mid: "Focus on design patterns, trade-offs, and practical engineering decisions. Expect intermediate depth.",
  senior: "Focus on architecture, scalability, system design, and mentoring ability. Expect deep technical knowledge.",
  staff: "Focus on org-wide impact, technical strategy, cross-team systems, and business alignment.",
};

const ROLE_INSTRUCTIONS: Record<RoleTarget, string> = {
  frontend: "Emphasize UI/UX, accessibility, performance, component architecture, state management, and browser APIs.",
  backend: "Emphasize APIs, databases, concurrency, distributed systems, security, and infrastructure.",
  fullstack: "Cover both frontend and backend equally, plus integration patterns and end-to-end ownership.",
  devops: "Emphasize CI/CD, infrastructure as code, monitoring, containers, cloud services, and reliability.",
  ml: "Emphasize model selection, data pipelines, training infrastructure, evaluation metrics, and MLOps.",
  mobile: "Emphasize platform APIs, performance, offline support, UI frameworks, and app store considerations.",
};

const COMPANY_INSTRUCTIONS: Record<CompanyStyle, string> = {
  faang: "Use Google/Meta/Amazon-style behavioral and system design questions. Ask about scale, ambiguity, and leadership principles.",
  startup: "Focus on shipping speed, wearing multiple hats, MVP thinking, and practical trade-offs over perfection.",
  enterprise: "Focus on compliance, maintainability, documentation, long-term architecture, and stakeholder communication.",
};

export function buildQuestionGenerationPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[],
  difficulty: Difficulty,
  role: RoleTarget,
  companyStyle: CompanyStyle
): string {
  const reposSummary = repos
    .map(
      (r) => `
${r.full_name}: ${Object.keys(r.languages).join(", ")} | ⭐${r.stargazers_count} | Files: ${r.files.slice(0, 8).map((f) => f.path).join(", ")} | Weakness: ${r.weaknessFlags.slice(0, 2).join("; ") || "none"}`
    )
    .join("\n");

  return `Analyze GitHub portfolio and generate 10 interview questions.

Developer: ${profile.login} (${profile.name || "N/A"}) — ${profile.bio || "N/A"} — ${profile.public_repos} repos
Config: difficulty=${difficulty} role=${role} company=${companyStyle}

Repos:
${reposSummary}

Each question: {"id":"unique","category":"cat","question":"text","modelAnswer":"2-3 paragraphs","keyPoints":["p1","p2","p3"],"commonMistakes":["m1","m2"],"followUp":"text","relatedRepo":"name","relatedFile":"path"}

Categories: project-deep-dive, technical-decisions, code-specific, problem-solving, behavioral, gaps-red-flags, trending

Return ONLY valid JSON array, no markdown.`;
}

export function buildChatSystemPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[]
): string {
  const reposContext = repos
    .map(
      (r) =>
        `${r.full_name}: [${Object.keys(r.languages).join(", ")}] ⭐${r.stargazers_count}`
    )
    .join("\n");

  return `You are RepoInterview AI, an expert interviewer analyzing ${profile.login}'s GitHub (${profile.bio || "N/A"}, ${profile.public_repos} repos).

Repos:
${reposContext}

Answer questions about this developer's portfolio with specific references to repos and files. Be concise and helpful. If you don't know, say so.`;
}

export function buildWeaknessAnalysisPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[]
): string {
  const reposSummary = repos
    .map(
      (r) => `
${r.full_name}: langs=[${Object.keys(r.languages).join(",")}] stars=${r.stargazers_count} forks=${r.forks_count}
  readme_chars=${r.readme?.length || 0} commits=${r.commits.length} files=${r.files.length}
  topics=[${r.topics.join(",")}] license=${r.license?.name || "none"} fork=${r.fork}
  pushed=${r.pushed_at} created=${r.created_at}
  weakness_flags=[${r.weaknessFlags.join(",")}]`
    )
    .join("\n");

  return `Analyze this developer's GitHub and identify weaknesses and strengths.

Profile: ${profile.login} - ${profile.bio || "N/A"} - ${profile.public_repos} repos

Repos:
${reposSummary}

Return JSON: {"weaknesses":[{"repo":"name","issues":[{"severity":"high|medium|low","message":"desc"}],"score":0-100}],"strengths":[{"repo":"name","message":"desc","category":"cat"}]}

Score 0-100 per repo. Return ONLY valid JSON, no markdown.`;
}

export function buildPracticePrompt(
  question: string,
  userAnswer: string,
  difficulty: Difficulty
): string {
  return `You are a technical interviewer grading a candidate's answer.

## Question
${question}

## Candidate's Answer
${userAnswer}

## Difficulty Level
${difficulty}

Grade the answer and provide:
1. A score from 0-100
2. What was good
3. What was missing
4. An improved model answer

Return JSON:
{
  "score": number,
  "feedback": "what was good",
  "missing": "what was missing",
  "improvedAnswer": "better answer"
}

Return ONLY valid JSON, no markdown.`;
}
