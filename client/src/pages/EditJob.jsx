import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const initialForm = {
  title: "",
  description: "",
  responsibilities: "",
  requiredSkills: "",
  preferredSkills: "",
  location: "",
  jobType: "full-time",
  experienceLevel: "entry",
  experienceYears: "",
  salaryMin: "",
  salaryMax: "",
  education: "",
  deadline: "",
  status: "open",
};

const inputClass =
  "w-full rounded-lg border border-[#eadfe8] bg-[#fffcfa] px-4 py-3 text-sm outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20";

const labelClass = "mb-2 block text-sm font-semibold text-[#35253d]";

const toList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/jobs/recruiter/mine/${jobId}`
        );
        const job = response.data;

        if (cancelled) return;

        setForm({
          title: job.title || "",
          description: job.description || "",
          responsibilities: (job.responsibilities || []).join(", "),
          requiredSkills: (job.requiredSkills || []).join(", "),
          preferredSkills: (job.preferredSkills || []).join(", "),
          location: job.location || "",
          jobType: job.jobType || "full-time",
          experienceLevel: job.experienceLevel || "entry",
          experienceYears: job.experienceYears ?? "",
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
          education: job.education || "",
          deadline: job.deadline
            ? String(job.deadline).slice(0, 10)
            : "",
          status: job.status || "open",
        });
        setLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Could not load this job."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      form.salaryMin !== "" &&
      form.salaryMax !== "" &&
      Number(form.salaryMax) < Number(form.salaryMin)
    ) {
      setError("Maximum salary must be greater than minimum salary.");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/jobs/${jobId}`, {
        title: form.title,
        description: form.description,
        responsibilities: toList(form.responsibilities),
        requiredSkills: toList(form.requiredSkills),
        preferredSkills: toList(form.preferredSkills),
        location: form.location,
        jobType: form.jobType,
        experienceLevel: form.experienceLevel,
        experienceYears:
          form.experienceYears === ""
            ? 0
            : Number(form.experienceYears),
        salaryMin:
          form.salaryMin === "" ? null : Number(form.salaryMin),
        salaryMax:
          form.salaryMax === "" ? null : Number(form.salaryMax),
        education: form.education,
        deadline: form.deadline || null,
        status: form.status,
      });

      navigate("/recruiter/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update this job."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        role="status"
        className="min-h-screen bg-[#fbf8f5] p-10 text-center text-gray-600"
      >
        Loading job...
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#fbf8f5] px-6 py-16 text-center">
        <p role="alert" className="text-red-700">
          {error}
        </p>
        <Link
          to="/recruiter/dashboard"
          className="mt-5 inline-block font-semibold text-[#473052] hover:underline"
        >
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f5] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/recruiter/dashboard"
          className="text-sm font-semibold text-[#473052] hover:underline"
        >
          ← Back to dashboard
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
          Recruiter workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#35253d]">
          Edit job
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Update the role, requirements, and publishing status.
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
          className="mt-8 space-y-7 rounded-xl border border-[#eadfe8] bg-white p-6 md:p-8"
        >
          {/* Basic details */}
          <section className="space-y-5">
            <h2 className="border-b border-[#eadfe8] pb-3 text-lg font-bold text-[#35253d]">
              Job details
            </h2>

            <div>
              <label htmlFor="title" className={labelClass}>
                Job title
              </label>
              <input
                id="title"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={form.description}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="responsibilities" className={labelClass}>
                Responsibilities
              </label>
              <input
                id="responsibilities"
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                placeholder="Build features, Review code, Work with designers"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate responsibilities with commas.
              </p>
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-5">
            <h2 className="border-b border-[#eadfe8] pb-3 text-lg font-bold text-[#35253d]">
              Skills and requirements
            </h2>

            <div>
              <label htmlFor="requiredSkills" className={labelClass}>
                Required skills
              </label>
              <input
                id="requiredSkills"
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
              <label htmlFor="preferredSkills" className={labelClass}>
                Preferred skills
              </label>
              <input
                id="preferredSkills"
                name="preferredSkills"
                value={form.preferredSkills}
                onChange={handleChange}
                placeholder="TypeScript, Docker"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="education" className={labelClass}>
                Education requirement
              </label>
              <input
                id="education"
                name="education"
                value={form.education}
                onChange={handleChange}
                placeholder="Degree in Computer Science or related field"
                className={inputClass}
              />
            </div>
          </section>

          {/* Role options */}
          <section className="space-y-5">
            <h2 className="border-b border-[#eadfe8] pb-3 text-lg font-bold text-[#35253d]">
              Role options
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="location" className={labelClass}>
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  required
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="jobType" className={labelClass}>
                  Job type
                </label>
                <select
                  id="jobType"
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
                <label htmlFor="experienceLevel" className={labelClass}>
                  Experience level
                </label>
                <select
                  id="experienceLevel"
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

              <div>
                <label htmlFor="experienceYears" className={labelClass}>
                  Years of experience
                </label>
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="salaryMin" className={labelClass}>
                  Minimum salary
                </label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min="0"
                  value={form.salaryMin}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="salaryMax" className={labelClass}>
                  Maximum salary
                </label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  value={form.salaryMax}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="deadline" className={labelClass}>
                  Application deadline
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="status" className={labelClass}>
                  Job status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#eadfe8] pt-6">
            <Link
              to="/recruiter/dashboard"
              className="rounded-lg border border-[#eadfe8] px-6 py-3 text-sm font-semibold text-[#35253d] hover:bg-[#f4e9f2]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#35253d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#593a67] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditJob;