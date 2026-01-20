import { NavLink } from "react-router-dom";

import DashboardIcon from "../assets/dashboard.svg";
import RaiseIcon from "../assets/raise.svg";
import OverallIcon from "../assets/overall.svg";
import MyIcon from "../assets/my.svg";
import AssignedIcon from "../assets/assigned.svg";

const Sidebar = () => {
  const linkStyle =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-100 transition";

  const activeStyle = "bg-purple-600 text-white";

  return (
    <div className="w-64 bg-white shadow-xl p-5 min-h-screen">
      <h2 className="text-xl font-bold text-purple-700 mb-8">
        Dashboard
      </h2>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${linkStyle} ${isActive ? activeStyle : ""}`
        }
      >
        <img src={DashboardIcon} className="w-5 h-5" />
        Dashboard
      </NavLink>

      <NavLink to="/raise" className={linkStyle}>
        <img src={RaiseIcon} className="w-5 h-5" />
        Raise Complaint
      </NavLink>

      <NavLink to="/overall" className={linkStyle}>
        <img src={OverallIcon} className="w-5 h-5" />
        Overall Complaints
      </NavLink>

      <NavLink to="/my" className={linkStyle}>
        <img src={MyIcon} className="w-5 h-5" />
        My Complaints
      </NavLink>

      <NavLink to="/assigned" className={linkStyle}>
        <img src={AssignedIcon} className="w-5 h-5" />
        Assigned To Me
      </NavLink>
    </div>
  );
};

export default Sidebar;
