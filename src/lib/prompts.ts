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
REPO: ${r.full_name}
Description: ${r.description || "No description"}
Languages: ${Object.keys(r.languages).join(", ")}
Stars: ${r.stargazers_count} | Forks: ${r.forks_count}
Topics: ${r.topics.join(", ") || "none"}
License: ${r.license?.name || "None"}
Last pushed: ${r.pushed_at}
README length: ${r.readme?.length || 0} chars
File count: ${r.files.length}
Commit count: ${r.commits.length}
Weakness flags: ${r.weaknessFlags.join("; ") || "none"}
Strengths: ${r.strengths.join("; ") || "none"}
Key files: ${r.files
        .slice(0, 15)
        .map((f) => f.path)
        .join(", ")}
`
    )
    .join("\n---\n");

  return `You are an expert technical interviewer analyzing a GitHub portfolio.

## Developer Profile
- Username: ${profile.login}
- Name: ${profile.name}
- Bio: ${profile.bio || "N/A"}
- Public repos: ${profile.public_repos}
- Followers: ${profile.followers}

## Interview Configuration
- Difficulty: ${difficulty} — ${DIFFERENCE_INSTRUCTIONS[difficulty]}
- Role focus: ${role} — ${ROLE_INSTRUCTIONS[role]}
- Company style: ${companyStyle} — ${COMPANY_INSTRUCTIONS[companyStyle]}

## Repositories (sorted by interview relevance)
${reposSummary}

## Task
Generate exactly 20 interview questions across these categories:
A. Project Deep-Dive (3 questions) — architecture walkthroughs
B. Technical Decisions (3 questions) — technology choice rationale
C. Code-Specific (3 questions) — reference actual files and functions
D. Problem-Solving (2 questions) — scaling and design challenges
E. Debugging Scenarios (2 questions) — production failure handling
F. Behavioral tied to repos (3 questions) — teamwork, bugs fixed, lessons learned
G. Gaps & Red Flags (2 questions) — missing tests, poor docs, outdated patterns
H. Trending/Modern (2 questions) — modern alternatives to patterns found in code

Return a JSON array. Each element:
{
  "id": "unique-id",
  "category": "one of the category slugs above",
  "question": "The question in interviewer tone",
  "modelAnswer": "2-4 paragraph model answer referencing actual repos/files",
  "keyPoints": ["what interviewer listens for 1", "...2", "...3"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "followUp": "Follow-up question the interviewer might ask",
  "relatedRepo": "repo full_name",
  "relatedFile": "optional file path"
}

IMPORTANT: Return ONLY valid JSON array, no markdown, no explanation.`;
}

export function buildChatSystemPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[]
): string {
  const reposContext = repos
    .map(
      (r) =>
        `${r.full_name}: ${r.description || "no desc"} [${Object.keys(r.languages).join(", ")}] Stars:${r.stargazers_count} Files:${r.files.map((f) => f.path).join(", ")}`
    )
    .join("\n");

  return `You are RepoInterview AI, an expert technical interviewer and code analyst.

## Developer Being Analyzed
- ${profile.login} (${profile.name || "N/A"})
- ${profile.bio || "No bio"}
- ${profile.public_repos} public repos, ${profile.followers} followers

## Their Repositories
${reposContext}

## Your Role
Answer questions about this developer's GitHub portfolio with specific references to their repos, files, code patterns, and commit history. Be helpful, specific, and cite file paths when relevant. If you don't have enough information, say so honestly.

Always respond in a conversational but technically precise tone. Reference specific repos and files when possible.`;
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

  return `Analyze this developer's GitHub profile and identify weaknesses and strengths.

## Profile
${profile.login} - ${profile.bio || "N/A"} - ${profile.public_repos} repos

## Repos
${reposSummary}

Return JSON with:
{
  "weaknesses": [
    { "repo": "repo_name", "issues": [{ "severity": "high|medium|low", "message": "description" }], "score": 0-100 }
  ],
  "strengths": [
    { "repo": "repo_name", "message": "description", "category": "category" }
  ]
}

Score each repo 0-100 for interview readiness. Focus on: test coverage, documentation, commit quality, code organization, language modernity, and project complexity.

Return ONLY valid JSON, no markdown.`;
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
