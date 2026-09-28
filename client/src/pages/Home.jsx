import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="bg-[#f7f8f4] text-[#172b2a]">
      {/* Hero */}
      <section className="bg-[#edf3e9]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 lg:py-28">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
              Your career starts here
            </p>

            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Find a job that fits{" "}
              <span className="text-[#347d61]">your skills.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#60716a]">
              Explore opportunities, analyze how your CV matches a role,
              and track your applications in one place.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/jobs"
                className="rounded-lg bg-[#172b2a] px-6 py-3 font-semibold text-white transition hover:bg-[#347d61]"
              >
                Explore jobs →
              </Link>
              <Link
                to="/register"
                className="rounded-lg border border-[#9db7a6] px-6 py-3 font-semibold text-[#172b2a] transition hover:bg-white"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* Illustration: clearly an example, not live CV data */}
          <div className="rounded-2xl bg-[#193b32] p-5 shadow-2xl md:p-8">
            <div className="rounded-xl bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#347d61]">
                  CV match preview
                </span>
                <span className="rounded-full bg-[#edf3e9] px-3 py-1 text-xs text-[#347d61]">
                  Example
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Frontend Developer
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Sample opportunity · Colombo
              </p>

              <div className="mt-7 border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold">Skills you can highlight</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["React", "JavaScript", "UI design"].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-[#e6f3ea] px-3 py-2 text-xs font-medium text-[#276348]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-7 text-sm leading-6 text-gray-600">
                See how your experience relates to a role before you apply.
              </p>
            </div>
          </div>
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