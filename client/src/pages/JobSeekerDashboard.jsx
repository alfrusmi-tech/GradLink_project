import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  pending: "bg-amber-50 text-amber-700",
  shortlisted: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/applications/me")
      .then((response) => {
        const items = response.data?.applications;
        setApplications(Array.isArray(items) ? items : []);
      })
      .catch(() => setError("Could not load your applications."))
      .finally(() => setLoading(false));
  }, []);

  const recent = applications.slice(0, 4);
  const shortlisted = applications.filter(
    (item) => item.status === "shortlisted"
  ).length;
  const accepted = applications.filter(
    (item) => item.status === "accepted"
  ).length;

  return (
    <main className="min-h-screen bg-[#fbf8f5] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
              Your workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#35253d] md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Keep track of your opportunities and next steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload-cv"
              className="rounded-lg border border-[#eadfe8] bg-white px-4 py-2.5 text-sm font-semibold text-[#35253d] hover:bg-[#f4e9f2]"
            >
              Manage CV
            </Link>
            <Link
              to="/jobs"
              className="rounded-lg bg-[#35253d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#593a67]"
            >
              Browse jobs →
            </Link>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-xl bg-white p-8 text-gray-600">
            Loading your dashboard...
          </div>
        ) : (
          <>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total applications", value: applications.length },
                { label: "Shortlisted", value: shortlisted },
                { label: "Accepted", value: accepted },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#eadfe8] bg-white p-6"
                >
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="mt-4 text-4xl font-bold text-[#35253d]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
                  Your activity
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#35253d]">
                  Recent applications
                </h2>
              </div>
              <Link
                to="/applications/history"
                className="text-sm font-semibold text-[#473052] hover:underline"
              >
                View all applications →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="mt-5 rounded-xl border border-[#eadfe8] bg-white p-10 text-center">
                <h3 className="text-lg font-bold text-[#35253d]">
                  No applications yet
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Browse jobs to find an opportunity you would like to apply for.
                </p>
                <Link
                  to="/jobs"
                  className="mt-5 inline-block font-semibold text-[#473052] hover:underline"
                >
                  Explore jobs →
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {recent.map((application) => (
                  <Link
                    key={application._id}
                    to={
                      application.job?._id
                        ? `/jobs/${application.job._id}`
                        : "/applications/history"
                    }
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#eadfe8] bg-white p-5 transition hover:border-[#f28c72] hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-bold text-[#35253d]">
                        {application.job?.title || "Job unavailable"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {application.job?.company?.name || "Company"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusColors[application.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {application.status || "Unknown"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default JobSeekerDashboard;