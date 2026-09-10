export interface GitHubProfile {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  location: string;
  company: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
  languages: Record<string, number>;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license: { spdx_id: string; name: string } | null;
  fork: boolean;
  size: number;
  default_branch: string;
}

export interface RepoFile {
  name: string;
  path: string;
  type: string;
  size: number;
}

export interface RepoCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
    committer: { date: string };
  };
}

export interface EnrichedRepo extends GitHubRepo {
  files: RepoFile[];
  commits: RepoCommit[];
  readme: string;
  interviewRelevance: number;
  weaknessFlags: string[];
  strengths: string[];
}

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
  commonMistakes: string[];
  followUp: string;
  relatedRepo: string;
  relatedFile?: string;
}

export type QuestionCategory =
  | "project-deep-dive"
  | "technical-decisions"
  | "code-specific"
  | "problem-solving"
  | "debugging-scenarios"
  | "behavioral"
  | "gaps-red-flags"
  | "trending-modern";

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  "project-deep-dive": "Project Deep-Dive",
  "technical-decisions": "Technical Decisions",
  "code-specific": "Code-Specific",
  "problem-solving": "Problem-Solving",
  "debugging-scenarios": "Debugging Scenarios",
  behavioral: "Behavioral",
  "gaps-red-flags": "Gaps & Red Flags",
  "trending-modern": "Trending / Modern",
};

export const CATEGORY_ICONS: Record<QuestionCategory, string> = {
  "project-deep-dive": "\u{1F3D7}",
  "technical-decisions": "\u{1F4A1}",
  "code-specific": "\u{1F4BB}",
  "problem-solving": "\u{1F9E0}",
  "debugging-scenarios": "\u{1F527}",
  behavioral: "\u{1F4AC}",
  "gaps-red-flags": "\u{26A0}\u{FE0F}",
  "trending-modern": "\u{1F525}",
};

export type Difficulty = "junior" | "mid" | "senior" | "staff";
export type RoleTarget =
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "ml"
  | "mobile";
export type CompanyStyle = "faang" | "startup" | "enterprise";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface WeaknessReport {
  repo: string;
  issues: { severity: "high" | "medium" | "low"; message: string }[];
  score: number;
}

export interface StrengthHighlight {
  repo: string;
  message: string;
  category: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  repo: string;
}

export interface InterviewSession {
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  scores: Record<string, number>;
  chatHistory: ChatMessage[];
  weaknesses: WeaknessReport[];
  strengths: StrengthHighlight[];
}
