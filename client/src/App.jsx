import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import JobListings from "./pages/JobListings.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import CompanyProfile from "./pages/CompanyProfile.jsx";
import Profile from "./pages/Profile.jsx";
import UploadCV from "./pages/UploadCV.jsx";
import CVAnalysis from "./pages/CVAnalysis.jsx";
import ApplicationHistory from "./pages/ApplicationHistory.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotFound from "./pages/NotFound.jsx";
import RecruiterDashboard from "./pages/RecruiterDashboard.jsx";
import JobSeekerDashboard from "./pages/JobSeekerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />

        {/* Job seeker routes */}
        <Route
          path="/jobseeker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <JobSeekerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-cv"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <UploadCV />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cv-analysis"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <CVAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <ApplicationHistory />
            </ProtectedRoute>
          }
        />

        {/* Recruiter routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
