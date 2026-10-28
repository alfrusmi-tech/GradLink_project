import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const selectClass =
  "w-full rounded-xl border border-[#eadfe8] bg-white px-4 py-3 text-sm outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20";

const emptyPagination = {
  currentPage: 1,
  totalPages: 1,
  total: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait until the user stops typing (400ms) before calling the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Load jobs from the server whenever a filter, sort or page changes.
  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError("");

    api
      .get("/jobs", {
        params: {
          q: debouncedSearch,
          jobType,
          experienceLevel: level,
          sort,
          page,
          limit: 9,
        },
      })
      .then((response) => {
        if (ignore) return;
        setJobs(response.data.jobs || []);
        setPagination(response.data.pagination || emptyPagination);
      })
      .catch(() => {
        if (!ignore) {
          setError("Could not load jobs. Please try again later.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    // Ignore the response of an outdated request.
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, jobType, level, sort, page]);

  // Changing a filter or the sort order returns to page 1.
  const onFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const hasActiveFilters = Boolean(debouncedSearch || jobType || level);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setJobType("");
    setLevel("");
    setSort("newest");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#fbf8f5]">
      <section className="bg-[#593a67] px-6 py-16 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f8c9bd]">
            Opportunities
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Find your next role.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-[#f3d9d2]">
            Explore jobs and discover opportunities that match your interests
            and skills.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <label
          htmlFor="job-search"
          className="mb-2 block text-sm font-semibold text-[#35253d]"
        >
          Search jobs
        </label>
        <input
          id="job-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, company, location, or skill"
          className="w-full rounded-xl border border-[#eadfe8] bg-white px-5 py-4 text-sm outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="job-type"
              className="mb-1 block text-xs font-semibold text-[#35253d]"
            >
              Job type
            </label>
            <select
              id="job-type"
              value={jobType}
              onChange={onFilterChange(setJobType)}
              className={selectClass}
            >
              <option value="">All job types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="job-level"
              className="mb-1 block text-xs font-semibold text-[#35253d]"
            >
              Experience level
            </label>
            <select
              id="job-level"
              value={level}
              onChange={onFilterChange(setLevel)}
              className={selectClass}
            >
              <option value="">All levels</option>
              <option value="entry">Entry</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="job-sort"
              className="mb-1 block text-xs font-semibold text-[#35253d]"
            >
              Sort by
            </label>
            <select
              id="job-sort"
              value={sort}
              onChange={onFilterChange(setSort)}
              className={selectClass}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salary_high">Highest salary</option>
              <option value="title_az">Title A-Z</option>
            </select>
          </div>
        </div>

        <div className="mb-6 mt-10 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#35253d]">Explore jobs</h2>
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[#593a67] hover:underline"
              >
                Clear filters
              </button>
            )}
            {!loading && !error && (
              <span className="text-sm text-gray-500">
                {pagination.total} {pagination.total === 1 ? "role" : "roles"}{" "}
                found
              </span>
            )}
          </div>
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

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-xl border border-[#eadfe8] bg-white p-10 text-center">
            <h3 className="text-lg font-bold">No jobs found</h3>
            <p className="mt-2 text-gray-600">
              {hasActiveFilters
                ? "Try another search term or clear the filters."
                : "There are no open jobs right now. Check back soon."}
            </p>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block rounded-xl border border-[#eadfe8] bg-white p-6 transition hover:-translate-y-1 hover:border-[#f28c72] hover:shadow-lg"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#35253d]">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {job.company?.name || "Company"} ·{" "}
                      {job.location || "Location not specified"}
                    </p>
                  </div>
                  <span className="text-xl text-[#593a67]">↗</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {job.jobType && (
                    <span className="rounded-md bg-[#f4e9f2] px-3 py-1.5 text-xs font-medium capitalize text-[#473052]">
                      {job.jobType}
                    </span>
                  )}
                  {job.experienceLevel && (
                    <span className="rounded-md bg-[#f4e9f2] px-3 py-1.5 text-xs font-medium capitalize text-[#473052]">
                      {job.experienceLevel}
                    </span>
                  )}
                  {job.requiredSkills?.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-[#fbf8f5] px-3 py-1.5 text-xs text-[#6f6472]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && pagination.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-8 flex items-center justify-between"
          >
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-[#eadfe8] bg-white px-4 py-2 text-sm font-medium text-[#35253d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-[#eadfe8] bg-white px-4 py-2 text-sm font-medium text-[#35253d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </main>
  );
};

export default Jobs;