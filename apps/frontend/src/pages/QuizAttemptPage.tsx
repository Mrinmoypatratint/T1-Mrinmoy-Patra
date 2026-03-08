import { useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz, useSubmitAttempt } from "../api/hooks";
import Navbar from "../components/Navbar";
import Timer from "../components/Timer";
import QuestionCard from "../components/QuestionCard";
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle } from "react-icons/hi";

export default function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading, isError } = useQuiz(id!);
  const submitMutation = useSubmitAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startedAtRef = useRef(new Date().toISOString());
  const hasSubmittedRef = useRef(false);

  const handleSelectAnswer = useCallback(
    (questionId: string, answerIndex: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || !quiz) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await submitMutation.mutateAsync({
        quizId: quiz.id,
        answers,
        startedAt: startedAtRef.current,
      });

      navigate(`/results/${result.id}`, { replace: true });
    } catch (err) {
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      console.error("Submit failed:", err);
    }
  }, [quiz, answers, submitMutation, navigate]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="glass-card p-8 animate-pulse">
            <div className="h-8 bg-white/10 rounded w-2/3 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="glass-card p-8">
            <p className="text-red-400 text-lg mb-4">
              Failed to load quiz. It may not exist.
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            <p className="text-white/40 text-sm mt-1">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <Timer totalSeconds={quiz.timeLimit} onTimeUp={handleTimeUp} />
        </div>

        {/* Question Navigation Dots */}
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  i === currentIndex
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-600/25"
                    : answers[q.id] !== undefined
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                }
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current Question */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion.id]}
          onSelectAnswer={handleSelectAnswer}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-30"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              className="btn-primary"
            >
              Next
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> Submitting…
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  Submit Quiz
                </>
              )}
            </button>
          )}
        </div>

        {/* Submit early option */}
        {currentIndex < questions.length - 1 && answeredCount === questions.length && (
          <div className="text-center animate-fade-in">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-secondary text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
              All questions answered — Submit now
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
