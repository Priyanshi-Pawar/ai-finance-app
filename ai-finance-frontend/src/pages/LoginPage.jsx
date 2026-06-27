import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter a name and password.");
      return;
    }

    setLoading(true);

    try {
      const value = identifier.trim();

      if (mode === "signup") {
        await register(value, password);
      }

      await login(value, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (mode === "signup"
            ? "Sign up failed. Please try again."
            : "Login failed. Please check your details.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
        <div className="absolute inset-0">
          <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-[-4rem] bottom-[-6rem] h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-surface/95 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.35)] backdrop-blur">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-wide text-gold">
              AI Finance
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {mode === "signup" ? "Create a new account" : "Login to continue"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Name
              </span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? mode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "signup"
                  ? "Create account"
                  : "Login"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
            }}
            className="mt-4 text-sm text-slate-300 transition hover:text-white"
          >
            {mode === "signup"
              ? "Back to login"
              : "New user? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
