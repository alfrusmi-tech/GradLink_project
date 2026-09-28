import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

const CVAnalysis = () => {
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(
    preselectedJobId || ""
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then((response) => {
        setJobs(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setError("Could not load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const runAnalysis = async (jobId) => {
    if (!jobId) {
      setResult(null);
      return;
    }

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post(`/cv/analyze/${jobId}`);
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not analyze your CV for this job."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (preselectedJobId) {
      runAnalysis(preselectedJobId);
    }
    // Run when the job ID in the URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedJobId]);

  const handleJobChange = (event) => {
    const jobId = event.target.value;
    setSelectedJobId(jobId);
    runAnalysis(jobId);
  };

  const percentage = Math.min(
    100,
    Math.max(0, Number(result?.matchPercentage) || 0)
  );

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
          Understand your fit
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#172b2a] md:text-4xl">
          CV Match Analysis
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-gray-600">
          Choose a job to compare its required skills with your uploaded CV.
        </p>

        <div className="mt-8 rounded-xl border border-[#dce7dc] bg-white p-6">
          <label
            htmlFor="analysis-job"
            className="mb-2 block text-sm font-semibold text-[#172b2a]"
          >
            Select a job
          </label>
          <select
            id="analysis-job"
            value={selectedJobId}
            onChange={handleJobChange}
            disabled={loading || analyzing}
            className="w-full rounded-lg border border-[#dce7dc] bg-[#fafbf8] px-4 py-3 text-sm outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20 disabled:opacity-60"
          >
            <option value="">
              {loading ? "Loading jobs..." : "Choose a job"}
            </option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} — {job.company?.name || "Company"}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}{" "}
            <Link to="/upload-cv" className="font-semibold underline">
              Check your CV
            </Link>
          </div>
        )}

        {analyzing && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-[#dce7dc] bg-white p-8 text-center text-gray-600"
          >
            Analyzing your CV...
          </div>
        )}

        {result && !analyzing && (
          <section className="mt-6 rounded-xl border border-[#dce7dc] bg-white p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
              Your result
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-bold text-[#172b2a]">
                Match with this role
              </h2>
              <span className="text-4xl font-bold text-[#276348]">
                {percentage}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7eee7]">
              <div
                className="h-full rounded-full bg-[#347d61]"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-lg bg-[#f0f8f1] p-5">
                <h3 className="font-bold text-[#276348]">
                  Matching skills
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.matchedSkills?.length ? (
                    result.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-white px-3 py-2 text-xs text-[#276348]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">
                      No matching skills were found.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-[#fff7ec] p-5">
                <h3 className="font-bold text-[#91601e]">
                  Skills to develop
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.missingSkills?.length ? (
                    result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-white px-3 py-2 text-xs text-[#91601e]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">
                      No missing skills were listed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {result.suggestions?.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-[#172b2a]">
                  Suggestions
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-600">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJobId && (
              <Link
                to={`/jobs/${selectedJobId}`}
                className="mt-8 inline-block rounded-lg bg-[#172b2a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#347d61]"
              >
                View job and apply →
              </Link>
            )}
          </section>
        )}

        {!result && !analyzing && !error && !selectedJobId && (
          <div className="mt-6 rounded-xl border border-[#dce7dc] bg-white p-8 text-center text-gray-600">
            Select a job above to see your CV match.
          </div>
        )}
      </div>
    </main>
  );
};

export default CVAnalysis;