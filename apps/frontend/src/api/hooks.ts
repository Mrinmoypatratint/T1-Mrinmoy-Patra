import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import type {
  ApiResponse,
  User,
  QuizSummary,
  QuizDetail,
  AttemptResult,
  AttemptHistoryItem,
  AttemptDetail,
  CreateQuizInput,
} from "../types";

// ─── Auth Hooks ────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
      return data.data!;
    },
    enabled: !!localStorage.getItem("token"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credential: string) => {
      const { data } = await apiClient.post<
        ApiResponse<{ token: string; user: User }>
      >("/auth/google", { credential });
      return data.data!;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
    }) => {
      const { data } = await apiClient.post<
        ApiResponse<{ token: string; user: User }>
      >("/auth/signup", input);
      return data.data!;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useEmailLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await apiClient.post<
        ApiResponse<{ token: string; user: User }>
      >("/auth/login", input);
      return data.data!;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

// ─── Quiz Hooks ────────────────────────────────────────

export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<ApiResponse<QuizSummary[]>>("/quizzes");
      return data.data!;
    },
    staleTime: 30 * 1000,
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<QuizDetail>>(
        `/quizzes/${id}`
      );
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuizInput) => {
      const { data } =
        await apiClient.post<ApiResponse<QuizDetail>>("/quizzes", input);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}

// ─── Attempt Hooks ─────────────────────────────────────

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      quizId: string;
      answers: Record<string, number>;
      startedAt: string;
    }) => {
      const { data } =
        await apiClient.post<ApiResponse<AttemptResult>>("/attempt", input);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useHistory(userId: string) {
  return useQuery({
    queryKey: ["history", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AttemptHistoryItem[]>>(
        `/attempt/results/${userId}`
      );
      return data.data!;
    },
    enabled: !!userId,
  });
}

export function useAttemptDetail(attemptId: string) {
  return useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AttemptDetail>>(
        `/attempt/detail/${attemptId}`
      );
      return data.data!;
    },
    enabled: !!attemptId,
  });
}
