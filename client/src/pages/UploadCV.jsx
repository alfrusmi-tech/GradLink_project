
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UploadCV = () => {
  const fileInputRef = useRef(null);
  const [cv, setCv] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/cv/me")
      .then((response) => setCv(response.data))
      .catch((err) => {
        if (err.response?.status !== 404) {
          setError(
            err.response?.data?.message ||
              "Could not load your CV."
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!selected) {
      setFile(null);
      return;
    }

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      setFile(null);
      event.target.value = "";
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("Your PDF must be smaller than 5 MB.");
      setFile(null);
      event.target.value = "";
      return;
    }

    setFile(selected);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const response = await api.post(
        "/cv/upload",
        formData
      );

      setCv(response.data.cv);
      setSuccess(
        response.data.message ||
          "CV uploaded successfully."
      );

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "CV upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  // Secure CV preview using authenticated API
  const handleViewCV = async () => {
    setViewing(true);
    setError("");

    // Open a blank tab immediately to avoid popup blocking.
    const previewTab = window.open(
      "",
      "_blank"
    );

    if (!previewTab) {
      setError(
        "Please allow pop-ups to preview your CV."
      );
      setViewing(false);
      return;
    }

    try {
      const response = await api.get(
        "/cv/me/file",
        {
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const blobURL = URL.createObjectURL(pdfBlob);

      previewTab.location.href = blobURL;

      // Release the temporary URL after the preview
      // has had time to load.
      setTimeout(() => {
        URL.revokeObjectURL(blobURL);
      }, 60000);

    } catch (err) {
      previewTab.close();

      setError(
        "Could not open your CV. Please try again."
      );
    } finally {
      setViewing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf8f5] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
          Your career tools
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#35253d]">
          Your CV
        </h1>

        <p className="mt-2 max-w-2xl leading-7 text-gray-600">
          Upload your PDF CV to review your skills and compare them with jobs.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-xl bg-white p-8">
            Loading your CV...
          </div>
        ) : (
          <>
            <form
              onSubmit={handleUpload}
              className="mt-8 rounded-xl border border-[#eadfe8] bg-white p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-[#35253d]">
                {cv ? "Replace your CV" : "Upload a CV"}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                PDF files only. Maximum size: 5 MB.
              </p>

              <label
                htmlFor="cv-file"
                className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-[#a9c9af] bg-[#fbf8f5] p-8 text-center hover:bg-[#f8e5df]"
              >
                <span className="block text-3xl text-[#593a67]">
                  ↑
                </span>

                <span className="mt-2 block font-semibold text-[#473052]">
                  Select your PDF CV
                </span>

                <span className="mt-1 block text-sm text-gray-600">
                  {file
                    ? file.name
                    : "Click here to choose a file"}
                </span>

                <input
                  id="cv-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              <button
                type="submit"
                disabled={!file || uploading}
                className="mt-6 rounded-lg bg-[#35253d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#593a67] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading and reading CV..."
                  : cv
                    ? "Replace CV"
                    : "Upload CV"}
              </button>
            </form>

            {cv ? (
              <section className="mt-6 rounded-xl border border-[#eadfe8] bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#593a67]">
                      Current CV
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#35253d]">
                      {cv.fileName || "Uploaded CV"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleViewCV}
                    disabled={viewing}
                    className="rounded-lg border border-[#a9c9af] px-4 py-2 text-sm font-semibold text-[#473052] hover:bg-[#f8e5df] disabled:opacity-50"
                  >
                    {viewing
                      ? "Opening..."
                      : "View PDF ↗"}
                  </button>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold text-[#35253d]">
                    Extracted skills
                  </h3>

                  {cv.extractedSkills?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cv.extractedSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-[#f4e9f2] px-3 py-2 text-xs font-medium text-[#473052]"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      No skills were detected. Check that
                      your CV has a clear skills section.
                    </p>
                  )}
                </div>

                <Link
                  to="/cv-analysis"
                  className="mt-8 inline-block rounded-lg bg-[#35253d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#593a67]"
                >
                  Analyze against a job →
                </Link>
              </section>
            ) : (
              <div className="mt-6 rounded-xl border border-[#eadfe8] bg-white p-8 text-center">
                <h2 className="font-bold text-[#35253d]">
                  No CV uploaded yet
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Choose a PDF above to get started.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default UploadCV;
