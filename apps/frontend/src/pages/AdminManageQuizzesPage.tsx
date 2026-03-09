import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminQuizzes, useDeleteQuiz, useUpdateQuiz } from "../api/hooks";
import Navbar from "../components/Navbar";
import {
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlinePlusCircle,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineQuestionMarkCircle,
  HiOutlineEyeOff,
  HiOutlineEye,
} from "react-icons/hi";

interface EditState {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  isPublished: boolean;
}

export default function AdminManageQuizzesPage() {
  const { data: quizzes, isLoading, isError } = useAdminQuizzes();
  const deleteMutation = useDeleteQuiz();
  const updateMutation = useUpdateQuiz();

  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  const handleEdit = (quiz: EditState) => {
    setEditing({ ...quiz });
    setDeleteConfirm(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync(editing);
      setEditing(null);
    } catch (err) {
      console.error("Failed to update quiz:", err);
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      await deleteMutation.mutateAsync(quizId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete quiz:", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manage Quizzes
            </h1>
            <p className="text-white/50">
              Edit or delete your quizzes.
            </p>
          </div>
          <Link to="/admin/create-quiz" className="btn-primary">
            <HiOutlinePlusCircle className="w-5 h-5" />
            Create Quiz
          </Link>
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
              Failed to load quizzes. Please try again.
            </p>
          </div>
        )}

        {/* Quiz List */}
        {quizzes && quizzes.length > 0 && (
          <div className="space-y-4">
            {quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className="glass-card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Editing mode */}
                {editing?.id === quiz.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editing.title}
                        onChange={(e) =>
                          setEditing({ ...editing, title: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editing.description}
                        onChange={(e) =>
                          setEditing({ ...editing, description: e.target.value })
                        }
                        className="input-field min-h-[80px] resize-y"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">
                          Time Limit (seconds)
                        </label>
                        <input
                          type="number"
                          value={editing.timeLimit}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              timeLimit: parseInt(e.target.value) || 30,
                            })
                          }
                          className="input-field max-w-[160px]"
                          min={30}
                          max={7200}
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer mt-6">
                        <input
                          type="checkbox"
                          checked={editing.isPublished}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              isPublished: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-sm text-white/70">Published</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                        {updateMutation.isPending ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        <HiOutlineX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {quiz.title}
                        </h3>
                        {!quiz.isPublished && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-400 rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/40 line-clamp-1 mb-3">
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/40">
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
                          {quiz.attemptCount} attempts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleEdit({
                            id: quiz.id,
                            title: quiz.title,
                            description: quiz.description,
                            timeLimit: quiz.timeLimit,
                            isPublished: quiz.isPublished,
                          })
                        }
                        className="p-2 text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                        title="Edit quiz"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            id: quiz.id,
                            title: quiz.title,
                            description: quiz.description,
                            timeLimit: quiz.timeLimit,
                            isPublished: !quiz.isPublished,
                          })
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          quiz.isPublished
                            ? "text-amber-400 hover:bg-amber-500/10"
                            : "text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                        title={quiz.isPublished ? "Unpublish" : "Publish"}
                      >
                        {quiz.isPublished ? (
                          <HiOutlineEyeOff className="w-5 h-5" />
                        ) : (
                          <HiOutlineEye className="w-5 h-5" />
                        )}
                      </button>

                      {deleteConfirm === quiz.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            {deleteMutation.isPending ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 text-xs font-medium bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setDeleteConfirm(quiz.id);
                            setEditing(null);
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete quiz"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {quizzes && quizzes.length === 0 && (
          <div className="glass-card p-12 text-center">
            <HiOutlineQuestionMarkCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No quizzes yet
            </h3>
            <p className="text-white/40 mb-6">
              Create your first quiz to get started.
            </p>
            <Link to="/admin/create-quiz" className="btn-primary">
              <HiOutlinePlusCircle className="w-5 h-5" />
              Create Quiz
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
