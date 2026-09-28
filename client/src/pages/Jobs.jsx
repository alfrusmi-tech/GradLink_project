import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then((response) => {
        setJobs(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setError("Could not load jobs. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const query = search.trim().toLowerCase();

  const filteredJobs = jobs.filter((job) => {
    const searchableText = [
      job.title,
      job.location,
      job.company?.name,
      ...(job.requiredSkills || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <section className="bg-[#193b32] px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9e3c5]">
            Opportunities
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Find your next role.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-[#c8dcd0]">
            Explore jobs and discover opportunities that match your interests
            and skills.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
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
          placeholder="Search by title, company, location, or skill"
          className="w-full rounded-xl border border-[#dce7dc] bg-white px-5 py-4 text-sm outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20"
        />

        <div className="mb-6 mt-10 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#172b2a]">Explore jobs</h2>
          {!loading && !error && (
            <span className="text-sm text-gray-500">
              {filteredJobs.length} roles found
            </span>
          )}
        </div>

        {loading && (
          <p className="rounded-xl bg-white p-8 text-gray-600">
            Loading jobs...
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-8 text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="rounded-xl border border-[#dce7dc] bg-white p-10 text-center">
            <h3 className="text-lg font-bold">No jobs found</h3>
            <p className="mt-2 text-gray-600">
              {search
                ? "Try another search term."
                : "There are no open jobs right now. Check back soon."}
            </p>
          </div>
        )}

        {!loading && !error && filteredJobs.length > 0 && (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block rounded-xl border border-[#dce7dc] bg-white p-6 transition hover:-translate-y-1 hover:border-[#83b99a] hover:shadow-lg"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#172b2a]">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {job.company?.name || "Company"} ·{" "}
                      {job.location || "Location not specified"}
                    </p>
                  </div>
                  <span className="text-xl text-[#347d61]">↗</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {job.jobType && (
                    <span className="rounded-md bg-[#e6f3ea] px-3 py-1.5 text-xs font-medium capitalize text-[#276348]">
                      {job.jobType}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Jobs;