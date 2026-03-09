import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  doc,
  writeBatch,
  updateDoc,
  deleteDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type {
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
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("Not authenticated");
      const snap = await getDoc(doc(db, "users", fbUser.uid));
      if (!snap.exists()) throw new Error("User not found");
      const d = snap.data();
      return {
        id: fbUser.uid,
        email: d.email,
        name: d.name,
        photoUrl: d.photoUrl || null,
        role: d.role,
        createdAt: d.createdAt?.toDate().toISOString() ?? "",
      } as User;
    },
    enabled: !!auth.currentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Quiz Hooks ────────────────────────────────────────

export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const q = query(
        collection(db, "quizzes"),
        where("isPublished", "==", true),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q).catch(async (err) => {
        // If composite index isn't ready yet, fall back to simpler query
        if (err.code === "failed-precondition") {
          const fallback = query(
            collection(db, "quizzes"),
            where("isPublished", "==", true),
          );
          return getDocs(fallback);
        }
        throw err;
      });
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          createdAt: data.createdAt?.toDate().toISOString() ?? "",
          creator: { id: data.createdBy, name: data.creatorName },
          questionCount: data.questionCount ?? 0,
          attemptCount: data.attemptCount ?? 0,
        } as QuizSummary;
      });
    },
    staleTime: 30 * 1000,
    enabled: !!auth.currentUser,
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => {
      const quizSnap = await getDoc(doc(db, "quizzes", id));
      if (!quizSnap.exists()) throw new Error("Quiz not found");
      const data = quizSnap.data();

      const qSnap = await getDocs(
        query(collection(db, "quizzes", id, "questions"), orderBy("order")),
      );
      const questions = qSnap.docs.map((qd) => ({
        id: qd.id,
        questionText: qd.data().questionText as string,
        options: qd.data().options as string[],
        order: qd.data().order as number,
      }));

      return {
        id: quizSnap.id,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        createdAt: data.createdAt?.toDate().toISOString() ?? "",
        creator: { id: data.createdBy, name: data.creatorName },
        attemptCount: data.attemptCount ?? 0,
        questions,
      } as QuizDetail;
    },
    enabled: !!id,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuizInput) => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("Not authenticated");

      const userSnap = await getDoc(doc(db, "users", fbUser.uid));
      const userName = userSnap.exists()
        ? userSnap.data().name
        : fbUser.displayName || "Unknown";

      const quizRef = await addDoc(collection(db, "quizzes"), {
        title: input.title,
        description: input.description,
        timeLimit: input.timeLimit,
        isPublished: true,
        createdBy: fbUser.uid,
        creatorName: userName,
        questionCount: input.questions.length,
        attemptCount: 0,
        createdAt: Timestamp.now(),
      });

      const batch = writeBatch(db);
      input.questions.forEach((q, idx) => {
        const qRef = doc(collection(db, "quizzes", quizRef.id, "questions"));
        batch.set(qRef, {
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          order: idx,
        });
      });
      await batch.commit();

      return {
        id: quizRef.id,
        title: input.title,
        description: input.description,
        timeLimit: input.timeLimit,
        createdAt: new Date().toISOString(),
        creator: { id: fbUser.uid, name: userName },
        attemptCount: 0,
        questions: input.questions.map((q, idx) => ({
          id: `temp-${idx}`,
          questionText: q.questionText,
          options: q.options,
          order: idx,
        })),
      } as QuizDetail;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}

export function useAdminQuizzes() {
  return useQuery({
    queryKey: ["adminQuizzes"],
    queryFn: async () => {
      const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q).catch(async () => {
        return getDocs(collection(db, "quizzes"));
      });
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          timeLimit: data.timeLimit,
          isPublished: data.isPublished ?? true,
          createdAt: data.createdAt?.toDate().toISOString() ?? "",
          creator: { id: data.createdBy, name: data.creatorName },
          questionCount: data.questionCount ?? 0,
          attemptCount: data.attemptCount ?? 0,
        };
      });
    },
    enabled: !!auth.currentUser,
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      title: string;
      description: string;
      timeLimit: number;
      isPublished: boolean;
    }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      await updateDoc(doc(db, "quizzes", input.id), {
        title: input.title,
        description: input.description,
        timeLimit: input.timeLimit,
        isPublished: input.isPublished,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuizzes"] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      if (!auth.currentUser) throw new Error("Not authenticated");

      // Delete all questions in subcollection first
      const questionsSnap = await getDocs(
        collection(db, "quizzes", quizId, "questions"),
      );
      const batch = writeBatch(db);
      questionsSnap.docs.forEach((qDoc) => batch.delete(qDoc.ref));
      if (!questionsSnap.empty) await batch.commit();

      // Delete the quiz document
      await deleteDoc(doc(db, "quizzes", quizId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["adminQuizzes"] });
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
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error("Not authenticated");

      // Check for duplicate attempt
      const existingSnap = await getDocs(
        query(
          collection(db, "attempts"),
          where("quizId", "==", input.quizId),
          where("userId", "==", fbUser.uid),
        ),
      );
      if (!existingSnap.empty) {
        throw new Error("You have already attempted this quiz.");
      }

      // Load quiz metadata
      const quizSnap = await getDoc(doc(db, "quizzes", input.quizId));
      if (!quizSnap.exists()) throw new Error("Quiz not found");
      const quizData = quizSnap.data();

      // Load questions with correct answers
      const questionsSnap = await getDocs(
        query(
          collection(db, "quizzes", input.quizId, "questions"),
          orderBy("order"),
        ),
      );

      // Grade
      let score = 0;
      const totalScore = questionsSnap.size;
      const review = questionsSnap.docs.map((qDoc) => {
        const qData = qDoc.data();
        const selected =
          input.answers[qDoc.id] !== undefined ? input.answers[qDoc.id] : -1;
        const isCorrect = selected === qData.correctAnswerIndex;
        if (isCorrect) score++;
        return {
          questionId: qDoc.id,
          questionText: qData.questionText as string,
          options: qData.options as string[],
          correctAnswerIndex: qData.correctAnswerIndex as number,
          selectedAnswerIndex: selected,
          isCorrect,
        };
      });

      // Save attempt
      const attemptRef = await addDoc(collection(db, "attempts"), {
        quizId: input.quizId,
        quizTitle: quizData.title,
        quizDescription: quizData.description ?? "",
        questionCount: totalScore,
        userId: fbUser.uid,
        answers: input.answers,
        score,
        totalScore,
        startedAt: Timestamp.fromDate(new Date(input.startedAt)),
        submittedAt: Timestamp.now(),
        review,
      });

      // Increment quiz attempt counter
      await updateDoc(doc(db, "quizzes", input.quizId), {
        attemptCount: increment(1),
      });

      return {
        id: attemptRef.id,
        quizId: input.quizId,
        quizTitle: quizData.title as string,
        score,
        totalScore,
        submittedAt: new Date().toISOString(),
      } as AttemptResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}

export function useHistory(userId: string) {
  return useQuery({
    queryKey: ["history", userId],
    queryFn: async () => {
      const q = query(
        collection(db, "attempts"),
        where("userId", "==", userId),
        orderBy("submittedAt", "desc"),
      );
      const snap = await getDocs(q).catch(async (err) => {
        if (err.code === "failed-precondition") {
          const fallback = query(
            collection(db, "attempts"),
            where("userId", "==", userId),
          );
          return getDocs(fallback);
        }
        throw err;
      });
      const items = snap.docs.map((d) => {
        const data = d.data();
        const pct = data.totalScore
          ? Math.round((data.score / data.totalScore) * 100)
          : 0;
        return {
          id: d.id,
          quizId: data.quizId,
          quizTitle: data.quizTitle,
          quizDescription: data.quizDescription ?? "",
          questionCount: data.questionCount ?? data.totalScore,
          score: data.score,
          totalScore: data.totalScore,
          percentage: pct,
          submittedAt: data.submittedAt?.toDate().toISOString() ?? "",
        } as AttemptHistoryItem;
      });
      // Sort client-side in case the fallback query was used (no orderBy)
      items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      return items;
    },
    enabled: !!userId && !!auth.currentUser,
  });
}

export function useAttemptDetail(attemptId: string) {
  return useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, "attempts", attemptId));
      if (!snap.exists()) throw new Error("Attempt not found");
      const data = snap.data();
      const pct = data.totalScore
        ? Math.round((data.score / data.totalScore) * 100)
        : 0;
      return {
        id: snap.id,
        quizId: data.quizId,
        quizTitle: data.quizTitle,
        score: data.score,
        totalScore: data.totalScore,
        percentage: pct,
        startedAt: data.startedAt?.toDate().toISOString() ?? "",
        submittedAt: data.submittedAt?.toDate().toISOString() ?? "",
        review: data.review ?? [],
      } as AttemptDetail;
    },
    enabled: !!attemptId && !!auth.currentUser,
  });
}
