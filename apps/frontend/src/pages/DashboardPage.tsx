import { Link } from "react-router-dom";
import { useQuizzes } from "../api/hooks";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { HiOutlineClock, HiOutlineUsers, HiOutlineQuestionMarkCircle, HiOutlineArrowRight } from "react-icons/hi";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: quizzes, isLoading, isError } = useQuizzes();

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-white/50 text-lg">
            Choose a quiz below and test your knowledge.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-white/5 rounded w-full mb-2" />
                <div className="h-4 bg-white/5 rounded w-2/3 mb-6" />
                <div className="h-10 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="glass-card p-8 text-center">
            <p className="text-red-400 text-lg mb-4">
              Failed to load quizzes. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {quizzes && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className="glass-card-hover p-6 flex flex-col animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Quiz title */}
                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                  {quiz.title}
                </h3>

                <p className="text-white/50 text-sm mb-6 line-clamp-3 flex-1">
                  {quiz.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6 text-sm text-white/40">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineQuestionMarkCircle className="w-4 h-4" />
                    {quiz.questionCount} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineClock className="w-4 h-4" />
                    {formatTime(quiz.timeLimit)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineUsers className="w-4 h-4" />
                    {quiz.attemptCount}
                  </span>
                </div>

                {/* Action */}
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="btn-primary w-full text-center group"
                >
                  Start Quiz
                  <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {quizzes && quizzes.length === 0 && (
          <div className="glass-card p-12 text-center">
            <HiOutlineQuestionMarkCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No quizzes available
            </h3>
            <p className="text-white/40">
              Check back later for new quizzes to attempt.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
