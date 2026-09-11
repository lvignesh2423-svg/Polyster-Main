import { create } from "zustand";
import type {
  GitHubProfile,
  EnrichedRepo,
  InterviewQuestion,
  ChatMessage,
  Difficulty,
  RoleTarget,
  CompanyStyle,
  WeaknessReport,
  StrengthHighlight,
  Flashcard,
} from "@/lib/types";

interface AppState {
  view: "hero" | "analyzing" | "dashboard" | "qa" | "flashcards" | "mock";
  setView: (v: AppState["view"]) => void;

  profile: GitHubProfile | null;
  setProfile: (p: GitHubProfile | null) => void;

  repos: EnrichedRepo[];
  setRepos: (r: EnrichedRepo[]) => void;

  selectedRepos: string[];
  toggleRepo: (name: string) => void;

  questions: InterviewQuestion[];
  setQuestions: (q: InterviewQuestion[]) => void;

  activeTab: "questions" | "qa" | "mock" | "flashcards";
  setActiveTab: (t: AppState["activeTab"]) => void;

  chatHistory: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;

  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;

  role: RoleTarget;
  setRole: (r: RoleTarget) => void;

  companyStyle: CompanyStyle;
  setCompanyStyle: (c: CompanyStyle) => void;

  weaknesses: WeaknessReport[];
  setWeaknesses: (w: WeaknessReport[]) => void;

  strengths: StrengthHighlight[];
  setStrengths: (s: StrengthHighlight[]) => void;

  flashcards: Flashcard[];
  setFlashcards: (f: Flashcard[]) => void;

  flashcardIndex: number;
  setFlashcardIndex: (i: number) => void;

  flashcardFlipped: boolean;
  setFlashcardFlipped: (f: boolean) => void;

  isLoading: boolean;
  setIsLoading: (l: boolean) => void;

  loadingMessage: string;
  setLoadingMessage: (m: string) => void;

  showSettings: boolean;
  setShowSettings: (s: boolean) => void;

  githubToken: string;
  setGithubToken: (t: string) => void;

  nvidiaKey: string;
  setNvidiaKey: (k: string) => void;

  isRegenerating: boolean;
  setIsRegenerating: (r: boolean) => void;

  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  view: "hero",
  setView: (view) => set({ view }),

  profile: null,
  setProfile: (profile) => set({ profile }),

  repos: [],
  setRepos: (repos) => set({ repos }),

  selectedRepos: [],
  toggleRepo: (name) =>
    set((state) => ({
      selectedRepos: state.selectedRepos.includes(name)
        ? state.selectedRepos.filter((n) => n !== name)
        : [...state.selectedRepos, name],
    })),

  questions: [],
  setQuestions: (questions) => set({ questions }),

  activeTab: "questions",
  setActiveTab: (activeTab) => set({ activeTab }),

  chatHistory: [],
  addChatMessage: (m) =>
    set((state) => ({ chatHistory: [...state.chatHistory, m] })),
  clearChat: () => set({ chatHistory: [] }),

  difficulty: "mid",
  setDifficulty: (difficulty) => set({ difficulty }),

  role: "fullstack",
  setRole: (role) => set({ role }),

  companyStyle: "faang",
  setCompanyStyle: (companyStyle) => set({ companyStyle }),

  weaknesses: [],
  setWeaknesses: (weaknesses) => set({ weaknesses }),

  strengths: [],
  setStrengths: (strengths) => set({ strengths }),

  flashcards: [],
  setFlashcards: (flashcards) => set({ flashcards }),

  flashcardIndex: 0,
  setFlashcardIndex: (flashcardIndex) => set({ flashcardIndex }),

  flashcardFlipped: false,
  setFlashcardFlipped: (flashcardFlipped) => set({ flashcardFlipped }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  loadingMessage: "",
  setLoadingMessage: (loadingMessage) => set({ loadingMessage }),

  showSettings: false,
  setShowSettings: (showSettings) => set({ showSettings }),

  githubToken: "",
  setGithubToken: (githubToken) => set({ githubToken }),

  nvidiaKey: "",
  setNvidiaKey: (nvidiaKey) => set({ nvidiaKey }),

  isRegenerating: false,
  setIsRegenerating: (isRegenerating) => set({ isRegenerating }),

  reset: () =>
    set({
      view: "hero",
      profile: null,
      repos: [],
      selectedRepos: [],
      questions: [],
      chatHistory: [],
      weaknesses: [],
      strengths: [],
      flashcards: [],
      flashcardIndex: 0,
      flashcardFlipped: false,
      isLoading: false,
      loadingMessage: "",
    }),
}));
