import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/auth/SignIn";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import AssignedIssues from "../pages/dashboard/AssignedIssues";
import RaiseComplaint from "../pages/dashboard/RaiseComplaint";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="assigned" element={<AssignedIssues />} />
        <Route path="raise" element={<RaiseComplaint />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
