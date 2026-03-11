import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuiz } from "../api/hooks";
import Navbar from "../components/Navbar";
import type { CreateQuestionInput } from "../types";
import { HiOutlinePlusCircle, HiOutlineTrash, HiOutlineCheckCircle } from "react-icons/hi";

const emptyQuestion: CreateQuestionInput = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
};

export default function AdminCreateQuizPage() {
  const navigate = useNavigate();
  const createMutation = useCreateQuiz();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(300);
  const [questions, setQuestions] = useState<CreateQuestionInput[]>([
    { ...emptyQuestion },
  ]);

  const updateQuestion = (index: number, field: keyof CreateQuestionInput, value: unknown) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = [...q.options] as [string, string, string, string];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...emptyQuestion, options: ["", "", "", ""] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        title,
        description,
        timeLimit,
        questions,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create quiz:", err);
    }
  };

  const isValid =
    title.trim() &&
    description.trim() &&
    timeLimit >= 30 &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.questionText.trim() &&
        q.options.every((o) => o.trim()) &&
        q.correctAnswerIndex >= 0 &&
        q.correctAnswerIndex <= 3
    );

  return (
    <div className="min-h-screen bg-surface-950 page-shell">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Create Quiz</h1>
          <p className="text-white/50">
            Fill in the details below to create a new quiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Details */}
          <div className="glass-card p-6 space-y-5 animate-slide-up">
            <h2 className="text-lg font-semibold text-white">Quiz Details</h2>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. JavaScript Fundamentals"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px] resize-y"
                placeholder="Describe what this quiz covers..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                className="input-field max-w-[200px]"
                min={30}
                max={7200}
                required
              />
              <p className="text-xs text-white/30 mt-1">
                {Math.floor(timeLimit / 60)} min {timeLimit % 60}s
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary text-sm px-4 py-2"
              >
                <HiOutlinePlusCircle className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="glass-card p-6 space-y-4 animate-slide-up"
                style={{ animationDelay: `${qIndex * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <span className="badge-info">Question {qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestion(qIndex, "questionText", e.target.value)
                    }
                    className="input-field"
                    placeholder="Enter your question..."
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/60">
                    Options
                  </label>
                  {q.options.map((opt, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex);
                    const isCorrect = q.correctAnswerIndex === optIndex;

                    return (
                      <div key={optIndex} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(qIndex, "correctAnswerIndex", optIndex)
                          }
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                            ${
                              isCorrect
                                ? "bg-emerald-500 text-white"
                                : "bg-white/10 text-white/40 hover:bg-white/20"
                            }
                          `}
                          title={isCorrect ? "Correct answer" : "Mark as correct"}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            updateOption(qIndex, optIndex, e.target.value)
                          }
                          className="input-field flex-1"
                          placeholder={`Option ${letter}`}
                          required
                        />
                        {isCorrect && (
                          <span className="text-emerald-400 text-xs whitespace-nowrap">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? (
                <>
                  <span className="animate-spin">⏳</span> Creating…
                </>
              ) : (
                <>
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  Create Quiz
                </>
              )}
            </button>
          </div>

          {createMutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              Failed to create quiz. Please check your input and try again.
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
