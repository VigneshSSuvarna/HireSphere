import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResumeScanner from "./ResumeScanner";
import DeanDashboard from "./DeanDashboard";
import CoordinatorDashboard from "./CoordinatorDashboard";
import Login from "./Login";
import Signup from "./Signup";
import DashboardLayout from "./DashboardLayout";
import StudentDashboard from "./StudentDashboard";
import Home from "./Home"; 
import ProfileSettings from "./ProfileSettings";
import PortalSelection from "./PortalSelection";
import ProtectedRoute from "./ProtectedRoute";
import DsaTracker from "./DsaTracker"; // 1. Imported DsaTracker

export default function App() {
  
  // GLOBAL THEME CONTROLLER
  useEffect(() => {
    const savedTheme = localStorage.getItem("hiresphere_theme") || "dark";
    if (!localStorage.getItem("hiresphere_theme")) {
      localStorage.setItem("hiresphere_theme", "dark");
    }
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/portals" element={<PortalSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
             <Route index element={<StudentDashboard />} />
             <Route path="dsa" element={<DsaTracker />} /> {/* 2. Added DSA route */}
             <Route path="scanner" element={<ResumeScanner />} />
             <Route path="coordinator" element={<CoordinatorDashboard />} />
             <Route path="admin" element={<DeanDashboard />} />
             <Route path="profile" element={<ProfileSettings />} /> 
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}