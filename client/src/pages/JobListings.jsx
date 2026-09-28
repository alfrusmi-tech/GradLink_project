import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs");
      const data = response.data;

      setJobs(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
            ? data.jobs
            : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const query = search.trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    const searchableText = [
      job.title,
      job.company?.name,
      job.location,
      ...(job.requiredSkills || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);
    const matchesType = jobType === "all" || job.jobType === jobType;

    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      {/* Page heading */}
      <section className="bg-[#193b32] px-6 pb-28 pt-16 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9e3c5]">
            Explore opportunities
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Find your next job.
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-[#c8dcd0]">
            Search opportunities by job title, company, location, or skill.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        {/* Search and filter panel */}
        <div className="-mt-14 grid gap-4 rounded-2xl border border-[#dce7dc] bg-white p-5 shadow-lg md:grid-cols-[1fr_220px] md:p-6">
          <div>
            <label
              htmlFor="job-search"
              className="mb-2 block text-sm font-semibold text-[#172b2a]"
            >
              Search jobs
            </label>
            <input
              id="job-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Job title, company, location, or skill"
              className="w-full rounded-lg border border-[#dce7dc] px-4 py-3 text-sm outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20"
            />
          </div>

          <div>
            <label
              htmlFor="job-type"
              className="mb-2 block text-sm font-semibold text-[#172b2a]"
            >
              Job type
            </label>
            <select
              id="job-type"
              value={jobType}
              onChange={(event) => setJobType(event.target.value)}
              className="w-full rounded-lg border border-[#dce7dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20"
            >
              <option value="all">All types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Results heading */}
        <div className="mb-6 mt-12 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
              Opportunities
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#172b2a]">
              Available jobs
            </h2>
          </div>

          {!loading && !error && (
            <p className="text-sm text-gray-600">
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"} found
            </p>
          )}
        </div>

        {loading && (
          <div role="status" className="rounded-xl bg-white p-8 text-gray-600">
            Loading jobs...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6"
          >
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadJobs}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="rounded-xl border border-[#dce7dc] bg-white p-10 text-center">
            <h3 className="text-lg font-bold text-[#172b2a]">
              No jobs found
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Try changing your search or job type.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setJobType("all");
              }}
              className="mt-5 font-semibold text-[#276348] hover:underline"
            >
              Clear filters →
            </button>
          </div>
        )}

        {!loading && !error && filteredJobs.length > 0 && (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block rounded-xl border border-[#dce7dc] bg-white p-6 transition hover:-translate-y-1 hover:border-[#83b99a] hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#e6f3ea] text-xl font-bold text-[#276348]">
                    {(job.company?.name || job.title || "G")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-4">
                      <h3 className="text-lg font-bold text-[#172b2a]">
                        {job.title}
                      </h3>
                      <span className="text-xl text-[#347d61]">↗</span>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {job.company?.name || "Company"} ·{" "}
                      {job.location || "Location not specified"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.jobType && (
                        <span className="rounded-md bg-[#e6f3ea] px-3 py-1.5 text-xs font-medium capitalize text-[#276348]">
                          {job.jobType.replace("-", " ")}
                        </span>
                      )}

                      {job.requiredSkills?.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-[#f2f5f0] px-3 py-1.5 text-xs text-[#52645b]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {job.experienceLevel && (
                      <p className="mt-4 text-xs capitalize text-gray-500">
                        {job.experienceLevel} level
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default JobListings;
