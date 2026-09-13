import type {
  Difficulty,
  RoleTarget,
  CompanyStyle,
  EnrichedRepo,
  GitHubProfile,
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

function buildRepoContext(repos: EnrichedRepo[]): string {
  return repos
    .map((r) => {
      const readmeSnippet = r.readme
        ? r.readme.slice(0, 800).replace(/\n{3,}/g, "\n\n")
        : "No README";
      const fileSnippets = (r.fileContents || [])
        .map((fc) => `--- ${fc.path} ---\n${fc.content.slice(0, 1500)}`)
        .join("\n\n");
      const fileList = r.files.slice(0, 10).map((f) => f.path).join(", ");
      const commitMsgs = r.commits.slice(0, 5).map((c) => c.commit.message).join("; ");

      return `REPOSITORY: ${r.full_name}
Languages: ${Object.keys(r.languages).join(", ")}
Stars: ${r.stargazers_count} | Forks: ${r.forks_count}
Files: ${fileList}
Recent commits: ${commitMsgs}
README (first 800 chars):
${readmeSnippet}
${fileSnippets ? "\nSource code snippets:\n" + fileSnippets : ""}`;
    })
    .join("\n\n");
}

export function buildQuestionGenerationPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[],
  difficulty: Difficulty,
  role: RoleTarget,
  companyStyle: CompanyStyle
): string {
  const repoContext = buildRepoContext(repos);

  return `You are an expert technical interviewer. Analyze this developer's GitHub portfolio including their actual code, README files, and commit history. Generate 10 interview questions that are deeply specific to their actual projects.

Developer: ${profile.login} (${profile.name || "N/A"})
Bio: ${profile.bio || "N/A"}
Public repos: ${profile.public_repos}

Difficulty: ${difficulty} — ${DIFFERENCE_INSTRUCTIONS[difficulty]}
Role focus: ${role} — ${ROLE_INSTRUCTIONS[role]}
Company style: ${companyStyle} — ${COMPANY_INSTRUCTIONS[companyStyle]}

REPOSITORIES WITH CODE AND DOCUMENTATION:
${repoContext}

REQUIREMENTS FOR QUESTIONS:
- Each question MUST reference specific code, files, or patterns from their actual repositories
- Questions should require the developer to explain THEIR OWN code decisions
- Include questions about: architecture choices, specific algorithms, code patterns, bug fixes, performance decisions
- Questions must feel like a real interview, not generic quiz questions
- Reference specific file paths and function names from their code

Return a JSON array of exactly 10 objects. Each object:
{
  "id": "q1",
  "category": "one of: project-deep-dive, technical-decisions, code-specific, problem-solving, debugging-scenarios, behavioral, gaps-red-flags, trending-modern",
  "question": "A specific question about their actual code or project",
  "modelAnswer": "A 2-3 sentence ideal answer referencing the code",
  "keyPoints": ["point1", "point2", "point3"],
  "commonMistakes": ["mistake1", "mistake2"],
  "followUp": "A follow-up question to dig deeper",
  "relatedRepo": "repo name",
  "relatedFile": "path/to/file.ext"
}

Return ONLY the JSON array. No markdown, no explanation, no code fences.`;
}

export function buildChatSystemPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[]
): string {
  const repoContext = buildRepoContext(repos);

  return `You are RepoInterview AI, an expert technical interviewer. You have full access to ${profile.login}'s GitHub portfolio including their actual source code, README files, and commit history.

Developer: ${profile.login} (${profile.name || "N/A"})
Bio: ${profile.bio || "N/A"}
Public repos: ${profile.public_repos}

REPOSITORIES WITH CODE AND DOCUMENTATION:
${repoContext}

CRITICAL RULES:
- Answer in plain text only. NEVER use markdown formatting. No asterisks, no hashtags, no bullet symbols, no code fences.
- Write in clean, natural paragraphs.
- Reference specific files, functions, and code patterns from their actual repositories.
- If asked about their code, explain what you see in the actual source files.
- If asked interview questions, tailor them to the specific code patterns you see.
- Be conversational and professional, like a real interviewer.`;
}

export function buildMockInterviewPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[],
  difficulty: Difficulty
): string {
  const repoContext = buildRepoContext(repos);

  return `You are a senior technical interviewer conducting a MOCK INTERVIEW with ${profile.login}.

Developer: ${profile.login} (${profile.name || "N/A"})
Bio: ${profile.bio || "N/A"}
Difficulty level: ${difficulty}

REPOSITORIES WITH CODE AND DOCUMENTATION:
${repoContext}

INTERVIEW RULES:
- Ask ONE question at a time based on their ACTUAL code and projects
- Reference specific files, functions, and patterns from their repositories
- After each answer, give brief feedback (2-3 sentences) then ask the next question
- Questions should cover: code architecture, specific algorithms, design decisions, debugging scenarios
- Make it feel like a real FAANG/tech company interview
- After 10 questions, provide a final score and summary

CRITICAL FORMATTING RULES:
- Answer in plain text ONLY. NEVER use asterisks, hashtags, markdown, or code fences.
- Write in clean, natural paragraphs like a real person talking.
- No bold, no italic, no bullet points with symbols.
- Just plain conversational English.`;
}

export function buildWeaknessAnalysisPrompt(
  profile: GitHubProfile,
  repos: EnrichedRepo[]
): string {
  const repoContext = buildRepoContext(repos);

  return `Analyze this developer's GitHub portfolio including their actual code quality, README documentation, and commit patterns.

Developer: ${profile.login} — ${profile.bio || "N/A"} — ${profile.public_repos} repos

REPOSITORIES WITH CODE AND DOCUMENTATION:
${repoContext}

Score each repository 0-100 based on:
- Code quality and patterns visible in source files
- Documentation completeness (README)
- Commit history and development activity
- Project structure and organization

Return JSON: {"weaknesses":[{"repo":"name","issues":[{"severity":"high|medium|low","message":"specific issue from actual code"}],"score":0-100}],"strengths":[{"repo":"name","message":"specific strength from actual code","category":"cat"}]}

Return ONLY valid JSON, no markdown.`;
}

export function buildPracticePrompt(
  question: string,
  userAnswer: string,
  difficulty: Difficulty
): string {
  return `You are a technical interviewer grading a candidate's answer.

Question: ${question}

Candidate's Answer: ${userAnswer}

Difficulty Level: ${difficulty}

Grade the answer and provide:
1. A score from 0-100
2. What was good
3. What was missing
4. An improved model answer

Return JSON: {"score": number, "feedback": "what was good", "missing": "what was missing", "improvedAnswer": "better answer"}

Return ONLY valid JSON, no markdown.`;
}
