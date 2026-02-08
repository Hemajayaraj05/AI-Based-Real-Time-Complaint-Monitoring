import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import DashboardIcon from "../../assets/dashboard.svg";
import RaiseIcon from "../../assets/raise.svg";
import OverallIcon from "../../assets/overall.svg";
import MyIcon from "../../assets/my.svg";
import AssignedIcon from "../../assets/assigned.svg";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const base =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-100 transition";

  const active = "bg-purple-600 text-white";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white shadow-xl p-5 min-h-screen flex flex-col">
      <div>
        <h2 className="text-xl font-bold text-purple-700 mb-2">
          Dashboard
        </h2>
        {user && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6 text-sm">
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-gray-600 text-xs">{user.email}</p>
            <p className="text-purple-600 font-medium text-xs mt-1 capitalize">
              {user.role}
            </p>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-2 mb-6">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `${base} ${isActive ? active : ""}`
            }
          >
            <img src={DashboardIcon} className="w-5 h-5" />
            Dashboard
          </NavLink>

          {/* STUDENTS & TEACHERS: Can raise complaints */}
          {(user?.role === "student" || user?.role === "teacher" || user?.role === "admin") && (
            <NavLink to="/dashboard/raise" className={base}>
              <img src={RaiseIcon} className="w-5 h-5" />
              Raise Complaint
            </NavLink>
          )}

          {/* ALL ROLES: Can see overall complaints */}
          <NavLink to="/dashboard/overall" className={base}>
            <img src={OverallIcon} className="w-5 h-5" />
            Overall Complaints
          </NavLink>

          {/* ALL ROLES: Can see their own complaints */}
          <NavLink to="/dashboard/my" className={base}>
            <img src={MyIcon} className="w-5 h-5" />
            My Complaints
          </NavLink>

          {/* TEACHERS & ADMINS: Can see assigned issues */}
          {(user?.role === "teacher" || user?.role === "admin") && (
            <NavLink to="/dashboard/assigned" className={base}>
              <img src={AssignedIcon} className="w-5 h-5" />
              Assigned To Me
            </NavLink>
          )}
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto w-full py-2 px-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold text-sm"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
