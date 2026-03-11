import { Link } from "react-router-dom";
import { useHistory } from "../api/hooks";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { HiOutlineClock, HiOutlineEye, HiOutlineTrendingUp } from "react-icons/hi";

export default function HistoryPage() {
  const { user } = useAuth();
  const { data: history, isLoading, isError } = useHistory(user?.id || "");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-surface-950 page-shell">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <p className="section-kicker mb-2">Your progress</p>
          <h1 className="text-3xl font-bold text-white mb-2">Attempt History</h1>
          <p className="text-white/50">
            Review your past quiz attempts and scores.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/2 mb-3" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="glass-card p-8 text-center">
            <p className="text-red-400 text-lg">
              Failed to load history. Please try again.
            </p>
          </div>
        )}

        {/* History List */}
        {history && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={item.id}
                className="glass-card-hover p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {item.quizTitle}
                    </h3>
                    <p className="text-sm text-white/40 mt-1 line-clamp-1">
                      {item.quizDescription}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
                      <span className="flex items-center gap-1.5">
                        <HiOutlineClock className="w-4 h-4" />
                        {formatDate(item.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineTrendingUp className="w-4 h-4" />
                        {item.questionCount} questions
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          item.percentage >= 70
                            ? "text-emerald-400"
                            : item.percentage >= 40
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.percentage}%
                      </div>
                      <div className="text-xs text-white/40">
                        {item.score}/{item.totalScore}
                      </div>
                    </div>

                    <Link
                      to={`/results/${item.id}`}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {history && history.length === 0 && (
          <div className="glass-card p-12 text-center">
            <HiOutlineClock className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No attempts yet
            </h3>
            <p className="text-white/40 mb-6">
              Start a quiz to see your results here.
            </p>
            <Link to="/dashboard" className="btn-primary">
              Browse Quizzes
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
