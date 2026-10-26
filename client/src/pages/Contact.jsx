import { Link } from "react-router-dom";

const Contact = () => {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;

  return (
    <main className="min-h-screen bg-[#fbf8f5] px-6 py-16 md:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
          Get in touch
        </p>
        <h1 className="mt-3 text-4xl font-bold text-[#35253d]">
          How can we help?
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-gray-600">
          Have a question about GradLink? You can also explore jobs or learn
          more about the project using the links below.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#eadfe8] bg-white p-7">
            <span className="text-3xl text-[#593a67]">✉</span>
            <h2 className="mt-4 text-xl font-bold text-[#35253d]">
              Contact the team
            </h2>

            {contactEmail ? (
              <>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Select the button to open your email application.
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-6 inline-block rounded-lg bg-[#35253d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#593a67]"
                >
                  Email us →
                </a>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-gray-600">
                A contact email has not been configured yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#eadfe8] bg-white p-7">
            <span className="text-3xl text-[#593a67]">↗</span>
            <h2 className="mt-4 text-xl font-bold text-[#35253d]">
              Explore GradLink
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Find out how the platform works and browse available jobs.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[#473052]">
              <Link to="/about" className="hover:underline">
                About us →
              </Link>
              <Link to="/jobs" className="hover:underline">
                Browse jobs →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;