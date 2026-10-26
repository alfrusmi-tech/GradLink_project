import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#fbf8f5] px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="text-8xl font-bold tracking-tight text-[#f8d9d0]">
          404
        </p>
        <h1 className="mt-5 text-3xl font-bold text-[#35253d]">
          We couldn't find that page.
        </h1>
        <p className="mt-4 leading-7 text-gray-600">
          The link may be incorrect, or the page may have moved.
          You can return home or explore available jobs.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-[#35253d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#593a67]"
          >
            Go home
          </Link>
          <Link
            to="/jobs"
            className="rounded-lg border border-[#f8d9d0] bg-white px-5 py-3 text-sm font-semibold text-[#35253d] hover:bg-[#f4e9f2]"
          >
            Browse jobs
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
