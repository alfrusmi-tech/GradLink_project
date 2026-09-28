import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const PostJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    preferredSkills: "",
    location: "",
    jobType: "full-time",
    experienceLevel: "entry",
    salaryMin: "",
    salaryMax: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      form.salaryMin &&
      form.salaryMax &&
      Number(form.salaryMax) < Number(form.salaryMin)
    ) {
      setError("Maximum salary must be greater than minimum salary.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/jobs", {
        ...form,
        requiredSkills: form.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        preferredSkills: form.preferredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        salaryMin: form.salaryMin
          ? Number(form.salaryMin)
          : undefined,
        salaryMax: form.salaryMax
          ? Number(form.salaryMax)
          : undefined,
      });

      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not post the job.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#dce7dc] bg-[#fafbf8] px-4 py-3 outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20";

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/recruiter/dashboard"
          className="text-sm font-semibold text-[#276348] hover:underline"
        >
          ← Back to dashboard
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
          Recruiter workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#172b2a]">
          Post a new job
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Describe the role and the skills candidates will need.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border border-[#dce7dc] bg-white p-6 md:p-8"
        >
          <div>
            <label htmlFor="job-title" className="mb-2 block text-sm font-semibold">
              Job title
            </label>
            <input
              id="job-title"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Junior Frontend Developer"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="job-description" className="mb-2 block text-sm font-semibold">
              Job description
            </label>
            <textarea
              id="job-description"
              name="description"
              required
              rows={6}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role and responsibilities..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="required-skills" className="mb-2 block text-sm font-semibold">
              Required skills
            </label>
            <input
              id="required-skills"
              name="requiredSkills"
              required
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="React, JavaScript, CSS"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate skills with commas.
            </p>
          </div>

          <div>
            <label htmlFor="preferred-skills" className="mb-2 block text-sm font-semibold">
              Preferred skills
            </label>
            <input
              id="preferred-skills"
              name="preferredSkills"
              value={form.preferredSkills}
              onChange={handleChange}
              placeholder="TypeScript, Docker"
              className={inputClass}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="job-location" className="mb-2 block text-sm font-semibold">
                Location
              </label>
              <input
                id="job-location"
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="Colombo, Sri Lanka"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="job-type" className="mb-2 block text-sm font-semibold">
                Job type
              </label>
              <select
                id="job-type"
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label htmlFor="experience-level" className="mb-2 block text-sm font-semibold">
                Experience level
              </label>
              <select
                id="experience-level"
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="entry">Entry</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="salary-min" className="mb-2 block text-sm font-semibold">
                Minimum salary (optional)
              </label>
              <input
                id="salary-min"
                name="salaryMin"
                type="number"
                min="0"
                value={form.salaryMin}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="salary-max" className="mb-2 block text-sm font-semibold">
                Maximum salary (optional)
              </label>
              <input
                id="salary-max"
                name="salaryMax"
                type="number"
                min="0"
                value={form.salaryMax}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#172b2a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#347d61] disabled:opacity-60"
          >
            {saving ? "Posting..." : "Post job →"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default PostJob;