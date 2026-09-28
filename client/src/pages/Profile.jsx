import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    skills: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((response) => {
        const profile = response.data.user;
        setEmail(profile.email || "");
        setForm({
          name: profile.name || "",
          phone: profile.phone || "",
          location: profile.location || "",
          skills: (profile.skills || []).join(", "),
        });
      })
      .catch(() => setError("Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      await api.put("/users/profile", {
        name: form.name,
        phone: form.phone,
        location: form.location,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#dce7dc] bg-[#fafbf8] px-4 py-3 outline-none focus:border-[#347d61] focus:ring-2 focus:ring-[#347d61]/20";

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#347d61]">
          Your account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#172b2a]">
          My profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Keep your details up to date.
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
            Profile updated successfully.
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-xl bg-white p-8">
            Loading your profile...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-xl border border-[#dce7dc] bg-white p-6 md:p-8"
          >
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold">
                Full name
              </label>
              <input
                id="profile-name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold">
                Email address
              </label>
              <input
                id="profile-email"
                value={email}
                disabled
                className={`${inputClass} text-gray-500`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed here.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-phone" className="mb-2 block text-sm font-semibold">
                  Phone
                </label>
                <input
                  id="profile-phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-location" className="mb-2 block text-sm font-semibold">
                  Location
                </label>
                <input
                  id="profile-location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {user?.role === "jobseeker" && (
              <div>
                <label htmlFor="profile-skills" className="mb-2 block text-sm font-semibold">
                  Skills
                </label>
                <input
                  id="profile-skills"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="JavaScript, React, MongoDB"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate skills with commas.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#172b2a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#347d61] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default Profile;