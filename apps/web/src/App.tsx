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
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="scanner" element={<ResumeScanner />} />
            <Route path="coordinator" element={<CoordinatorDashboard />} />
            <Route path="dean" element={<DeanDashboard />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}