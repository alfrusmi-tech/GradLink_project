import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="gradlink-main bg-[#f7f8f4] text-[#172b2a]">
      {/* Hero */}
      <section className="gradlink-landing">
        <div className="gradlink-copy">
          <p className="gradlink-badge">Your career starts here</p>

          <h1 className="gradlink-headline">
            Find a job that fits your skills.
          </h1>

          <p className="gradlink-description">
            Explore opportunities, analyze how your CV matches a role,
            and track your applications in one place.
          </p>

          <div className="gradlink-actions">
            <Link
              to="/jobs"
              className="gradlink-button gradlink-button-primary"
            >
              Explore jobs →
            </Link>
            <Link
              to="/register"
              className="gradlink-button gradlink-button-secondary"
            >
              Create an account
            </Link>
          </div>
        </div>

        <div className="gradlink-hero-visual">
          <img
            src="/attractive-businesswoman-with-laptop_231208-10621.avif"
            alt="Businesswoman working on a laptop"
            className="gradlink-hero-image"
          />
        </div>
      </section>

      {/* Two user paths */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
          One platform, two paths
        </p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          Move forward with GradLink
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#dce7dc] bg-white p-8">
            <span className="text-sm font-bold text-[#347d61]">
              FOR GRADUATES
            </span>
            <h3 className="mt-5 text-2xl font-bold">Find your next step.</h3>
            <p className="mt-3 leading-7 text-gray-600">
              Browse jobs, upload your CV, check your skills against a role,
              and follow your applications.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-block font-semibold text-[#276348] hover:underline"
            >
              Join as a graduate →
            </Link>
          </div>

          <div className="rounded-2xl bg-[#193b32] p-8 text-white">
            <span className="text-sm font-bold text-[#b9e3c5]">
              FOR RECRUITERS
            </span>
            <h3 className="mt-5 text-2xl font-bold">Meet great talent.</h3>
            <p className="mt-3 leading-7 text-[#c8dcd0]">
              Post opportunities, review applicants, and manage your
              hiring process.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-block font-semibold text-[#b9e3c5] hover:underline"
            >
              Join as a recruiter →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;