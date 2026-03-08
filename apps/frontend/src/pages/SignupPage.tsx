import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin, useSignup } from "../api/hooks";
import { HiOutlineAcademicCap, HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleLoginMutation = useGoogleLogin();
  const signupMutation = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      const result = await signupMutation.mutateAsync({ name, email, password });
      login(result.token, result.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setFormError(error.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  const isLoading = googleLoginMutation.isPending || signupMutation.isPending;

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
            Create your account to get started.
          </p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-8 animate-slide-up">
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Create Account
          </h2>
          <p className="text-white/40 text-center mb-6">
            Fill in your details below
          </p>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div className="relative">
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-11"
                placeholder="Full name"
                autoComplete="name"
              />
            </div>
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
                placeholder="Password (min. 8 characters)"
                autoComplete="new-password"
              />
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="Confirm password"
                autoComplete="new-password"
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
              {signupMutation.isPending ? "Creating account…" : "Create Account"}
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
              text="signup_with"
              width="300"
            />
          </div>

          {googleLoginMutation.isError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              Google signup failed. Please try again.
            </div>
          )}

          {isLoading && (
            <div className="mt-4 text-center text-white/50 text-sm animate-pulse">
              Creating account…
            </div>
          )}

          {/* Login link */}
          <p className="mt-6 text-center text-white/40 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
