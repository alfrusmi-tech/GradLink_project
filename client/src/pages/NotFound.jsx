import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f8f4] px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="text-8xl font-bold tracking-tight text-[#b6d5be]">
          404
        </p>
        <h1 className="mt-5 text-3xl font-bold text-[#172b2a]">
          We couldn't find that page.
        </h1>
        <p className="mt-4 leading-7 text-gray-600">
          The link may be incorrect, or the page may have moved.
          You can return home or explore available jobs.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-[#172b2a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#347d61]"
          >
            Go home
          </Link>
          <Link
            to="/jobs"
            className="rounded-lg border border-[#b6d5be] bg-white px-5 py-3 text-sm font-semibold text-[#172b2a] hover:bg-[#edf3e9]"
          >
            Browse jobs
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
