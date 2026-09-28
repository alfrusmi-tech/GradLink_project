import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/jobseeker/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-72px)] bg-white md:grid-cols-2">
      <section className="hidden items-center bg-[#193b32] p-12 text-white md:flex lg:p-20">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9e3c5]">
            Welcome back
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight">
            Your next opportunity is waiting.
          </h1>
          <p className="mt-6 leading-8 text-[#c8dcd0]">
            Discover roles, understand your skills, and follow your
            applications from one place.
          </p>
          <div className="mt-12 text-6xl text-[#94caa5]"></div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
            GradLink
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#172b2a]">
            Log in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details to continue.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-[#172b2a]"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#dce7dc] bg-[#fafbf8] px-4 py-3 outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-[#172b2a]"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[#dce7dc] bg-[#fafbf8] px-4 py-3 outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#172b2a] px-5 py-3 font-semibold text-white transition hover:bg-[#347d61] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in →"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#276348] hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;