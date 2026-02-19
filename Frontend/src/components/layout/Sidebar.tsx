import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import DashboardIcon from "../../assets/dashboard.svg";
import RaiseIcon from "../../assets/raise.svg";
import OverallIcon from "../../assets/overall.svg";
import MyIcon from "../../assets/my.svg";
import AssignedIcon from "../../assets/assigned.svg";

const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-5 left-5 z-50 lg:hidden p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Static on all pages */}
      <aside className={`bg-white border-r border-purple-200 shadow-none p-6 flex-col lg:static lg:flex lg:w-64 lg:max-h-screen lg:overflow-hidden ${
        isMobileOpen ? "fixed inset-y-0 left-0 w-64 z-40 flex max-h-screen overflow-hidden" : "hidden"
      }`}>
        {/* Logo / Branding */}
        <div className="mb-8 pb-6 border-b border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
              📋
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Complaint Hub</h1>
              <p className="text-xs text-purple-600 font-medium">Management System</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="bg-linear-to-br from-purple-50 to-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
            <p className="text-slate-500 text-xs mt-1 truncate">{user.email}</p>
            <div className="mt-3 pt-3 border-t border-purple-200">
              <span className="inline-block px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold capitalize border border-purple-200">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-2 mb-auto">
          <NavLink
            to="/dashboard"
            end
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-purple-50"
              }`
            }
          >
            <img src={DashboardIcon} className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/raise"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-purple-50"
              }`
            }
          >
            <img src={RaiseIcon} className="w-5 h-5" />
            Raise Complaint
          </NavLink>

          <NavLink
            to="/dashboard/overall"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-purple-50"
              }`
            }
          >
            <img src={OverallIcon} className="w-5 h-5" />
            Overall Complaints
          </NavLink>

          <NavLink
            to="/dashboard/my"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-purple-50"
              }`
            }
          >
            <img src={MyIcon} className="w-5 h-5" />
            My Complaints
          </NavLink>

          {user?.role !== "student" && (
            <NavLink
              to="/dashboard/assigned"
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-purple-50"
                }`
              }
            >
              <img src={AssignedIcon} className="w-5 h-5" />
              Assigned To Me
            </NavLink>
          )}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-all duration-200 font-semibold text-sm"
        >
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
