import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiOutlineAcademicCap, HiOutlineLogout, HiOutlineClipboardList, HiOutlinePlusCircle, HiOutlineCollection, HiOutlineCog } from "react-icons/hi";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 text-xl font-bold text-white hover:text-brand-300 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-violet-500/25 border border-white/10 flex items-center justify-center">
              <HiOutlineAcademicCap className="w-5 h-5 text-brand-300" />
            </span>
            <span>
              Quiz Portal
              <span className="hidden sm:block text-[10px] tracking-widest uppercase text-white/35 -mt-0.5">
                Learning Hub
              </span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <HiOutlineCollection className="w-4 h-4" />
              Quizzes
            </Link>

            <Link
              to="/history"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <HiOutlineClipboardList className="w-4 h-4" />
              History
            </Link>

            {isAdmin && (
              <Link
                to="/admin/create-quiz"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-all"
              >
                <HiOutlinePlusCircle className="w-4 h-4" />
                Create Quiz
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/manage"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-all"
              >
                <HiOutlineCog className="w-4 h-4" />
                Manage
              </Link>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-2 ring-brand-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}

              <div className="hidden sm:block leading-tight">
                <span className="text-sm font-medium text-white/85 block">
                  {user?.name}
                </span>
                <span className="text-[11px] text-white/40 block -mt-0.5">
                  {isAdmin ? "Admin" : "Learner"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Sign out"
              >
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
