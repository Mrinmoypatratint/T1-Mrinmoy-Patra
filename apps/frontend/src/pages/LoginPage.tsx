import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin, useEmailLogin } from "../api/hooks";
import { HiOutlineAcademicCap, HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineClock, HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleLoginMutation = useGoogleLogin();
  const emailLoginMutation = useEmailLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    try {
      const result = await googleLoginMutation.mutateAsync(
        response.credential
      );
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      const result = await emailLoginMutation.mutateAsync({ email, password });
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setFormError(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  const isLoading = googleLoginMutation.isPending || emailLoginMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-surface-950 to-purple-950" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-2xl shadow-brand-600/30 mb-6">
            <HiOutlineAcademicCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Quiz Portal
          </h1>
          <p className="text-white/50 text-lg">
            Challenge yourself. Track your progress. Level up.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 animate-slide-up">
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-white/40 text-center mb-6">
            Sign in to continue
          </p>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11"
                placeholder="Email address"
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {emailLoginMutation.isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.error("Google login error")}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signin_with"
              width="300"
            />
          </div>

          {googleLoginMutation.isError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              Google login failed. Please try again.
            </div>
          )}

          {isLoading && (
            <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
              Authenticating…
            </div>
          )}

          {/* Sign up link */}
          <p className="mt-6 text-center text-white/40 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="text-center p-4">
            <HiOutlineLightningBolt className="w-6 h-6 text-brand-400 mx-auto mb-2" />
            <span className="text-xs text-white/40">Interactive Quizzes</span>
          </div>
          <div className="text-center p-4">
            <HiOutlineClock className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs text-white/40">Timed Challenges</span>
          </div>
          <div className="text-center p-4">
            <HiOutlineShieldCheck className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <span className="text-xs text-white/40">Track Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
