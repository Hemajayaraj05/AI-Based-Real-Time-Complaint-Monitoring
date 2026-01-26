import { NavLink } from "react-router-dom";

import DashboardIcon from "../../assets/dashboard.svg";
import RaiseIcon from "../../assets/raise.svg";
import OverallIcon from "../../assets/overall.svg";
import MyIcon from "../../assets/my.svg";
import AssignedIcon from "../../assets/assigned.svg";

const Sidebar: React.FC = () => {
  const base =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-100 transition";

  const active = "bg-purple-600 text-white";

  return (
    <aside className="w-64 bg-white shadow-xl p-5 min-h-screen">
      <h2 className="text-xl font-bold text-purple-700 mb-8">
        Dashboard
      </h2>

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

      <NavLink to="/dashboard/raise" className={base}>
        <img src={RaiseIcon} className="w-5 h-5" />
        Raise Complaint
      </NavLink>

      <NavLink to="/dashboard/overall" className={base}>
        <img src={OverallIcon} className="w-5 h-5" />
        Overall Complaints
      </NavLink>

      <NavLink to="/dashboard/my" className={base}>
        <img src={MyIcon} className="w-5 h-5" />
        My Complaints
      </NavLink>

      <NavLink to="/dashboard/assigned" className={base}>
        <img src={AssignedIcon} className="w-5 h-5" />
        Assigned To Me
      </NavLink>
    </aside>
  );
};

export default Sidebar;
