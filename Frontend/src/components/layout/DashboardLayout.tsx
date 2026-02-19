import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-white lg:bg-linear-to-br lg:from-white lg:via-purple-50 lg:to-white">
      <Sidebar />
      <main className="flex-1 pt-20 lg:pt-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-screen overflow-auto w-full">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
