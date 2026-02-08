import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import AssignedIssues from "../pages/dashboard/AssignedIssues";
import RaiseComplaint from "../pages/dashboard/RaiseComplaint";
import OverAllComplaints from "../pages/dashboard/OverAllCompliants";
import MyComplaints from "../pages/dashboard/MyCompliants";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="assigned" element={<AssignedIssues />} />
        <Route path="raise" element={<RaiseComplaint />} />
        <Route path="overall" element={<OverAllComplaints />} />
        <Route path="my" element={<MyComplaints />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
