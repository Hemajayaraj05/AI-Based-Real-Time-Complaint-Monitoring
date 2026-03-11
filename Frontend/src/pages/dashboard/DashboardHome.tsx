import { useAuth } from "../../context/AuthContext";
import ComplaintAnalysisChart from "../../components/dashboard/ComplaintAnalysisChart";
import DashboardStatsOverview from "../../components/dashboard/DashboardStatsOverview";
import DivisionWiseChart from "../../components/dashboard/DivisionWiseChart";
import PriorityDistributionChart from "../../components/dashboard/PriorityDistributionChart";

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8 lg:space-y-10 pt-2 lg:pt-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-lg">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
          {getGreeting()}, <span className="text-purple-100">{user?.name?.split(" ")[0]}</span>! 
        </h1>
        <p className="text-purple-100 text-base sm:text-lg lg:text-lg leading-relaxed max-w-2xl">
          {user?.role === "admin" && "Monitor and manage all complaints across divisions"}
          {user?.role === "division_head" && `Manage complaints for: ${user?.division || "your division"}`}
          {user?.role === "student" && "Track the status of your complaints and get timely updates"}
          {!["admin", "division_head", "student"].includes(user?.role || "") && "Manage your assigned complaints efficiently"}
        </p>
      </div>

      {/* Stats Cards */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Overview</h2>
          <div className="h-1 w-12 bg-linear-to-r from-purple-600 to-purple-500 rounded-full"></div>
        </div>
        <DashboardStatsOverview />
      </div>

      {/* Monthly Trends Chart */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Complaint Trends</h2>
          <div className="h-1 w-12 bg-linear-to-r from-purple-600 to-purple-500 rounded-full"></div>
        </div>
        <ComplaintAnalysisChart />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        {/* Division-wise Chart - Only for Admin */}
        {user?.role === "admin" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-slate-900">Division Performance</h2>
            </div>
            <DivisionWiseChart />
          </div>
        )}
        
        {/* Priority Distribution */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">Priority Distribution</h2>
          </div>
          <PriorityDistributionChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
