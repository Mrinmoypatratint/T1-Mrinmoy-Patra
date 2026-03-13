import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "../firebase";
import type {
  User,
  QuizSummary,
  QuizDetail,
  AttemptResult,
  AttemptHistoryItem,
  AttemptDetail,
  CreateQuizInput,
} from "../types";

// Base URL — override with VITE_API_URL in .env for production
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

// ─── Core fetch helper ─────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();

  const res = await fetch(`${API_URL}/api/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

// ─── Auth Hooks ────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<User>("me"),
    enabled: !!auth.currentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Quiz Hooks ────────────────────────────────────────

export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: () => apiFetch<QuizSummary[]>("quizzes"),
    staleTime: 30 * 1000,
    enabled: !!auth.currentUser,
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => apiFetch<QuizDetail>(`quizzes/${id}`),
    enabled: !!id && !!auth.currentUser,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateQuizInput) =>
      apiFetch<QuizDetail>("quizzes", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuizzes"] });
    },
  });
}

export function useAdminQuizzes() {
  return useQuery({
    queryKey: ["adminQuizzes"],
    queryFn: () =>
      apiFetch<(QuizSummary & { isPublished: boolean })[]>("admin/quizzes"),
    enabled: !!auth.currentUser,
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      title: string;
      description: string;
      timeLimit: number;
      isPublished: boolean;
    }) =>
      apiFetch(`quizzes/${input.id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuizzes"] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) =>
      apiFetch(`quizzes/${quizId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuizzes"] });
    },
  });
}

// ─── Attempt Hooks ─────────────────────────────────────

export function useUserAttemptedQuizIds() {
  return useQuery({
    queryKey: ["attemptedQuizIds"],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return new Set<string>();
      const items = await apiFetch<AttemptHistoryItem[]>(`results/${user.uid}`);
      return new Set(items.map((i) => i.quizId));
    },
    enabled: !!auth.currentUser,
    staleTime: 30_000,
  });
}

export function useHasAttempted(quizId: string) {
  return useQuery({
    queryKey: ["hasAttempted", quizId],
    queryFn: async () => {
      const data = await apiFetch<{ attemptId: string | null }>(
        `quizzes/${quizId}/my-attempt`,
      );
      return data.attemptId ?? null;
    },
    enabled: !!quizId && !!auth.currentUser,
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      quizId: string;
      answers: Record<string, number>;
      startedAt: string;
    }) =>
      apiFetch<AttemptResult>("attempt", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["attemptedQuizIds"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}

export function useHistory(userId: string) {
  return useQuery({
    queryKey: ["history", userId],
    queryFn: () => apiFetch<AttemptHistoryItem[]>(`results/${userId}`),
    enabled: !!userId && !!auth.currentUser,
  });
}

export function useAttemptDetail(attemptId: string) {
  return useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => apiFetch<AttemptDetail>(`attempts/${attemptId}`),
    enabled: !!attemptId && !!auth.currentUser,
  });
}

