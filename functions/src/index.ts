import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// ─── Submit Quiz Attempt (server-side scoring) ─────────

interface SubmitInput {
  quizId: string;
  answers: Record<string, number>;
  startedAt: string;
}

export const submitQuizAttempt = functions.https.onCall(
  async (data: SubmitInput, context: functions.https.CallableContext) => {
    // 1. Validate auth
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }
    const uid = context.auth.uid;
    const { quizId, answers, startedAt } = data;

    if (!quizId || !answers || typeof answers !== "object") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "quizId and answers are required."
      );
    }

    // 2. Check duplicate attempt
    const existingSnap = await db
      .collection("attempts")
      .where("quizId", "==", quizId)
      .where("userId", "==", uid)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "You have already attempted this quiz."
      );
    }

    // 3. Load quiz metadata
    const quizDoc = await db.collection("quizzes").doc(quizId).get();
    if (!quizDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Quiz not found.");
    }
    const quizData = quizDoc.data()!;

    // 4. Load questions (server-side — includes correctAnswerIndex)
    const questionsSnap = await db
      .collection("quizzes")
      .doc(quizId)
      .collection("questions")
      .orderBy("order")
      .get();

    // 5. Grade server-side
    let score = 0;
    const totalScore = questionsSnap.size;
    const review = questionsSnap.docs.map((qDoc) => {
      const qData = qDoc.data();
      const selected =
        answers[qDoc.id] !== undefined ? answers[qDoc.id] : -1;
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

    // 6. Save attempt
    const attemptRef = await db.collection("attempts").add({
      quizId,
      quizTitle: quizData.title,
      quizDescription: quizData.description ?? "",
      questionCount: totalScore,
      userId: uid,
      answers,
      score,
      totalScore,
      startedAt: admin.firestore.Timestamp.fromDate(new Date(startedAt)),
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      review,
    });

    // 7. Increment quiz attempt counter
    await db
      .collection("quizzes")
      .doc(quizId)
      .update({
        attemptCount: admin.firestore.FieldValue.increment(1),
      });

    return {
      id: attemptRef.id,
      quizId,
      quizTitle: quizData.title as string,
      score,
      totalScore,
      submittedAt: new Date().toISOString(),
    };
  }
);
