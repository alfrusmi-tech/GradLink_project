import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  description: "",
  industry: "",
  website: "",
  location: "",
  companySize: "",
  foundedYear: "",
};

const CompanyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id =
      typeof user?.company === "object"
        ? user.company?._id
        : user?.company;

    if (!id) {
      setLoading(false);
      return;
    }

    api
      .get(`/companies/${id}`)
      .then((response) => {
        const company = response.data;
        setCompanyId(company._id);
        setForm({
          name: company.name || "",
          description: company.description || "",
          industry: company.industry || "",
          website: company.website || "",
          location: company.location || "",
          companySize: company.companySize || "",
          foundedYear: company.foundedYear || "",
        });
      })
      .catch(() => setError("Could not load your company profile."))
      .finally(() => setLoading(false));
  }, [user?.company]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      foundedYear: form.foundedYear
        ? Number(form.foundedYear)
        : undefined,
    };

    try {
      if (companyId) {
        await api.put(`/companies/${companyId}`, payload);
      } else {
        await api.post("/companies", payload);
      }

      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#eadfe8] bg-[#fffcfa] px-4 py-3 outline-none focus:border-[#593a67] focus:ring-2 focus:ring-[#593a67]/20";

  return (
    <main className="min-h-screen bg-[#fbf8f5] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#593a67]">
          Recruiter workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#35253d]">
          {companyId ? "Edit company profile" : "Create company profile"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Add the details candidates should know about your company.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-xl bg-white p-8">
            Loading company profile...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-xl border border-[#eadfe8] bg-white p-6 md:p-8"
          >
            <div>
              <label htmlFor="company-name" className="mb-2 block text-sm font-semibold">
                Company name
              </label>
              <input
                id="company-name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="company-description" className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                id="company-description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="What does your company do?"
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="company-industry" className="mb-2 block text-sm font-semibold">
                  Industry
                </label>
                <input
                  id="company-industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="Technology"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="company-location" className="mb-2 block text-sm font-semibold">
                  Location
                </label>
                <input
                  id="company-location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Colombo, Sri Lanka"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="company-size" className="mb-2 block text-sm font-semibold">
                  Company size
                </label>
                <input
                  id="company-size"
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange}
                  placeholder="11–50 employees"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="company-year" className="mb-2 block text-sm font-semibold">
                  Founded year
                </label>
                <input
                  id="company-year"
                  name="foundedYear"
                  type="number"
                  min="1800"
                  value={form.foundedYear}
                  onChange={handleChange}
                  placeholder="2020"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="company-website" className="mb-2 block text-sm font-semibold">
                Website
              </label>
              <input
                id="company-website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#35253d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#593a67] disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : companyId
                  ? "Update company"
                  : "Create company"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default CompanyProfile;
