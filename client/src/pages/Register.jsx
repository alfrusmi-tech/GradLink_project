import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobseeker",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(
        form.name,
        form.email,
        form.password,
        form.role
      );

      navigate(
        user.role === "recruiter" ? "/recruiter/dashboard" : "/jobs"
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-72px)] bg-white md:grid-cols-2">
      <section className="hidden items-center bg-[#593a67] p-12 text-white md:flex lg:p-20">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f8c9bd]">
            Join GradLink
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight">
            Make your next move with confidence.
          </h1>
          <p className="mt-6 leading-8 text-[#f3d9d2]">
            Whether you are searching for a role or hiring talent,
            your journey starts here.
          </p>
          <div className="mt-12 text-6xl text-[#f28c72]"></div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
            Get started
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#35253d]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Add your details and choose how you will use GradLink.
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
                htmlFor="register-name"
                className="mb-2 block text-sm font-semibold"
              >
                Full name
              </label>
              <input
                id="register-name"
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full rounded-lg border border-[#eadfe8] bg-[#fffcfa] px-4 py-3 outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#eadfe8] bg-[#fffcfa] px-4 py-3 outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-[#eadfe8] bg-[#fffcfa] px-4 py-3 outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20"
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">
                I want to
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-pressed={form.role === "jobseeker"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      role: "jobseeker",
                    }))
                  }
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
                    form.role === "jobseeker"
                      ? "border-[#593a67] bg-[#f4e9f2] text-[#473052]"
                      : "border-[#eadfe8] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Find a job
                </button>

                <button
                  type="button"
                  aria-pressed={form.role === "recruiter"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      role: "recruiter",
                    }))
                  }
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
                    form.role === "recruiter"
                      ? "border-[#593a67] bg-[#f4e9f2] text-[#473052]"
                      : "border-[#eadfe8] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Hire talent
                </button>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#35253d] px-5 py-3 font-semibold text-white transition hover:bg-[#593a67] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#473052] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;