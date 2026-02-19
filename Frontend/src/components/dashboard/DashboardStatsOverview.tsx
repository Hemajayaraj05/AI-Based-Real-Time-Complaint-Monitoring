import React, { useEffect, useState } from "react";
import { DocumentIcon, CheckCircleIcon, AlertIcon, ClockIcon } from "../icons/IconComponents";

type StatsData = {
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
};

const DashboardStatsOverview: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/stats/dashboard", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-7 animate-pulse border border-purple-100">
            <div className="h-4 bg-purple-200 rounded w-24 mb-4"></div>
            <div className="h-10 bg-purple-200 rounded w-16 mb-4"></div>
            <div className="h-3 bg-purple-100 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: <DocumentIcon />,
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircleIcon />,
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: <ClockIcon />,
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <AlertIcon />,
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl lg:rounded-2xl shadow hover:shadow-md transition-all duration-200 p-6 lg:p-7 border-2 ${card.borderColor}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm lg:text-base font-semibold text-slate-700">{card.label}</span>
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl flex items-center justify-center ${card.bgLight} ${card.textColor}`}>
              {card.icon}
            </div>
          </div>
          <div className={`text-4xl lg:text-5xl font-bold ${card.textColor} mb-2`}>
            {card.value}
          </div>
          {card.label === "Resolved" && stats.total > 0 && (
            <div className="text-xs lg:text-sm text-slate-600 font-medium">
              <span className="font-bold text-slate-800">{Math.round((stats.resolved / stats.total) * 100)}%</span> resolution rate
            </div>
          )}
          {card.label === "Total Complaints" && (
            <div className="text-xs lg:text-sm text-slate-600 font-medium">
              All complaints in system
            </div>
          )}
          {card.label === "In Progress" && (
            <div className="text-xs lg:text-sm text-slate-600 font-medium">
              Currently being handled
            </div>
          )}
          {card.label === "Pending" && (
            <div className="text-xs lg:text-sm text-slate-600 font-medium">
              Awaiting assignment
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsOverview;
