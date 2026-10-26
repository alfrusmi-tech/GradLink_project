import { Link } from "react-router-dom";

const About = () => {
  return (
    <main className="min-h-screen bg-[#fbf8f5]">
      <section className="bg-[#593a67] px-6 py-20 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f8c9bd]">
            About GradLink
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Connecting potential with opportunity.
          </h1>
          <p className="mt-6 max-w-2xl leading-8 text-[#f3d9d2]">
            GradLink brings graduates and recruiters together in one place,
            with tools to explore jobs and understand how skills fit a role.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          <article className="rounded-2xl border border-[#eadfe8] bg-white p-8">
            <span className="text-sm font-bold text-[#593a67]">
              FOR JOB SEEKERS
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#35253d]">
              Take the next step
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Create a profile, browse opportunities, upload your PDF CV,
              compare its skills with job requirements, and track your
              applications.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-block font-semibold text-[#473052] hover:underline"
            >
              Browse jobs →
            </Link>
          </article>

          <article className="rounded-2xl border border-[#eadfe8] bg-white p-8">
            <span className="text-sm font-bold text-[#593a67]">
              FOR RECRUITERS
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#35253d]">
              Find new talent
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Set up your company profile, publish jobs, review applicants,
              and manage applications through the hiring process.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-block font-semibold text-[#473052] hover:underline"
            >
              Create an account →
            </Link>
          </article>
        </div>

        <div className="mt-16 rounded-2xl bg-[#f4e9f2] p-8 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#35253d]">
            A clearer job search
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-[#6f6472]">
            GradLink helps you move from finding a job to applying for it.
            The CV analysis page compares extracted CV skills with a
            selected job and shows matching skills, missing skills, and
            suggestions.
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;