import type {
  GitHubProfile,
  GitHubRepo,
  RepoFile,
  RepoCommit,
  EnrichedRepo,
} from "./types";

const GITHUB_API = "https://api.github.com";

function headers(token?: string): HeadersInit {
  const h: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function parseGitHubUrl(input: string): string {
  const cleaned = input.trim().replace(/\/+$/, "");
  const patterns = [
    /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)(?:\/.*)?$/,
    /^@?([a-zA-Z0-9._-]+)$/,
    /^([a-zA-Z0-9._-]+)$/,
  ];
  for (const p of patterns) {
    const m = cleaned.match(p);
    if (m) return m[1];
  }
  throw new Error(`Invalid GitHub URL or username: ${input}`);
}

export async function fetchProfile(
  input: string,
  token?: string
): Promise<GitHubProfile> {
  const username = parseGitHubUrl(input);
  const res = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: headers(token),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GitHub user not found: ${username}`);
  return res.json();
}

export async function fetchRepos(
  username: string,
  token?: string
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`,
      { headers: headers(token) }
    );
    if (!res.ok) break;
    const batch = await res.json();
    if (!batch.length) break;
    repos.push(...batch);
    if (batch.length < perPage) break;
    page++;
    if (page > 10) break;
  }

  return repos.filter((r) => !r.fork);
}

export async function fetchRepoLanguages(
  fullName: string,
  token?: string
): Promise<Record<string, number>> {
  const res = await fetch(`${GITHUB_API}/repos/${fullName}/languages`, {
    headers: headers(token),
  });
  if (!res.ok) return {};
  return res.json();
}

export async function fetchRepoFiles(
  fullName: string,
  token?: string,
  path = ""
): Promise<RepoFile[]> {
  const url = path
    ? `${GITHUB_API}/repos/${fullName}/contents/${path}`
    : `${GITHUB_API}/repos/${fullName}/contents`;

  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) return [];
  const data = await res.json();

  if (!Array.isArray(data)) return [];

  const files: RepoFile[] = [];
  for (const item of data) {
    if (item.type === "file" && item.size > 0) {
      files.push({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
      });
    }
  }
  return files;
}

export async function fetchReadme(
  fullName: string,
  token?: string
): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/repos/${fullName}/readme`,
    headers(token) as RequestInit
  );
  if (!res.ok) return "";
  const data = await res.json();
  if (data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return "";
}

export async function fetchCommits(
  fullName: string,
  token?: string,
  limit = 30
): Promise<RepoCommit[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${fullName}/commits?per_page=${limit}`,
    { headers: headers(token) }
  );
  if (!res.ok) return [];
  return res.json();
}

export function rankRepos(repos: EnrichedRepo[]): EnrichedRepo[] {
  return repos
    .map((r) => {
      let score = 0;
      const age =
        (Date.now() - new Date(r.pushed_at).getTime()) /
        (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - age * 0.5);
      score += Math.min(20, r.stargazers_count * 2);
      score += Math.min(15, r.forks_count * 3);
      score += Math.min(15, Object.keys(r.languages).length * 3);
      score += Math.min(10, r.commits.length * 0.5);
      score += Math.min(10, r.files.length * 0.2);
      if (r.readme && r.readme.length > 200) score += 5;
      if (r.topics.length > 0) score += 3;
      if (r.license) score += 2;
      r.interviewRelevance = Math.round(Math.min(100, Math.max(0, score)));
      return r;
    })
    .sort((a, b) => b.interviewRelevance - a.interviewRelevance);
}

export function analyzeWeaknesses(r: EnrichedRepo): EnrichedRepo {
  const flags: string[] = [];
  const strengths: string[] = [];

  if (!r.readme || r.readme.length < 100)
    flags.push("Missing or minimal README");
  if (r.commits.length < 5) flags.push("Very few commits — may be incomplete");
  if (r.open_issues_count > 10) flags.push("Many open issues unresolved");
  if (!r.license) flags.push("No license specified");
  if (Object.keys(r.languages).length === 0)
    flags.push("No detectable languages");
  if (r.size < 10) flags.push("Very small repository");
  if (r.topics.length === 0) flags.push("No topics/tags for discoverability");

  if (r.stargazers_count > 50) strengths.push("Has community stars");
  if (r.forks_count > 10) strengths.push("Forked by others — shows reuse");
  if (r.commits.length > 50) strengths.push("Active development history");
  if (Object.keys(r.languages).length > 3)
    strengths.push("Multi-language project");
  if (r.readme && r.readme.length > 1000) strengths.push("Thorough documentation");
  if (r.topics.length > 3) strengths.push("Well-tagged project");

  r.weaknessFlags = flags;
  r.strengths = strengths;
  return r;
}
