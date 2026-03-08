import { useParams, Link, useNavigate } from "react-router-dom";
import { useAttemptDetail } from "../api/hooks";
import Navbar from "../components/Navbar";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowLeft, HiOutlineClipboardList } from "react-icons/hi";

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { data: attempt, isLoading, isError } = useAttemptDetail(attemptId!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="glass-card p-8 animate-pulse">
            <div className="h-10 bg-white/10 rounded w-1/2 mx-auto mb-8" />
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !attempt) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="glass-card p-8">
            <p className="text-red-400 text-lg mb-4">
              Failed to load results.
            </p>
            <button onClick={() => navigate("/dashboard")} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = attempt.review.filter((r) => r.isCorrect).length;
  const incorrectCount = attempt.review.length - correctCount;

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Score Summary */}
        <div className="glass-card p-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            {attempt.quizTitle}
          </h1>
          <p className="text-white/40 mb-8">Quiz Completed!</p>

          {/* Score Circle */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={attempt.percentage >= 70 ? "#10b981" : attempt.percentage >= 40 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - attempt.percentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {attempt.percentage}%
              </span>
              <span className="text-sm text-white/40">
                {attempt.score}/{attempt.totalScore}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {attempt.totalScore}
              </div>
              <div className="text-xs text-white/40 mt-1">Total</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-400">
                {correctCount}
              </div>
              <div className="text-xs text-emerald-400/60 mt-1">Correct</div>
            </div>
            <div className="bg-red-500/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-400">
                {incorrectCount}
              </div>
              <div className="text-xs text-red-400/60 mt-1">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Answer Review</h2>

          {attempt.review.map((item, index) => (
            <div
              key={item.questionId}
              className={`glass-card p-6 border-l-4 animate-slide-up ${
                item.isCorrect ? "border-l-emerald-500" : "border-l-red-500"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3 mb-4">
                {item.isCorrect ? (
                  <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <HiOutlineXCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <h3 className="text-white font-medium leading-relaxed">
                  {index + 1}. {item.questionText}
                </h3>
              </div>

              <div className="ml-9 space-y-2">
                {item.options.map((option, optIdx) => {
                  const isCorrectOption = optIdx === item.correctAnswerIndex;
                  const isSelectedOption = optIdx === item.selectedAnswerIndex;
                  const letter = String.fromCharCode(65 + optIdx);

                  let bgClass = "bg-white/5";
                  let textClass = "text-white/60";

                  if (isCorrectOption) {
                    bgClass = "bg-emerald-500/15";
                    textClass = "text-emerald-400";
                  } else if (isSelectedOption && !item.isCorrect) {
                    bgClass = "bg-red-500/15";
                    textClass = "text-red-400";
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-3 p-3 rounded-lg ${bgClass}`}
                    >
                      <span
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                          isCorrectOption
                            ? "bg-emerald-500 text-white"
                            : isSelectedOption && !item.isCorrect
                            ? "bg-red-500 text-white"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className={`${textClass} text-sm`}>{option}</span>
                      {isCorrectOption && (
                        <span className="ml-auto text-xs text-emerald-400">
                          ✓ Correct
                        </span>
                      )}
                      {isSelectedOption && !item.isCorrect && (
                        <span className="ml-auto text-xs text-red-400">
                          ✗ Your answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link to="/dashboard" className="btn-secondary">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
          <Link to="/history" className="btn-primary">
            <HiOutlineClipboardList className="w-4 h-4" />
            View History
          </Link>
        </div>
      </main>
    </div>
  );
}
