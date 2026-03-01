import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type PriorityStat = {
  priority: string;
  count: number;
};

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const PriorityDistributionChart: React.FC = () => {
  const [data, setData] = useState<PriorityStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriorityStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/stats/priority", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (res.ok) {
          const result = await res.json();
          setData(result.stats || []);
        }
      } catch (err) {
        console.error("Failed to fetch priority stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 animate-pulse border border-purple-100">
        <div className="h-6 bg-purple-200 rounded w-48 mb-6"></div>
        <div className="h-72 bg-purple-100 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1) + " Priority",
    value: item.count,
    priority: item.priority,
  }));

  const totalComplaints = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="w-full">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 border border-purple-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
              Priority Distribution
            </h2>
            <p className="text-slate-500 text-sm lg:text-base mt-1">
              Complaints by severity level
            </p>
          </div>
          <div className="inline-flex px-3 py-1.5 bg-purple-50 rounded-lg">
            <span className="text-sm font-semibold text-purple-700">Total: <strong>{totalComplaints}</strong></span>
          </div>
        </div>

        {/* Chart and Stats Container */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Pie Chart Section */}
          <div className="h-72 sm:h-80 lg:h-96 -mx-4 sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ value }) => value}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.priority as keyof typeof COLORS] || "#888"} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "2px solid #e9d5ff",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 24 }}
                  iconType="square"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Summary */}
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {data.map((item) => (
            <div
              key={item.priority}
              className="text-center p-4 sm:p-5 lg:p-5 rounded-lg border-2 transition-all"
              style={{
                borderColor: COLORS[item.priority as keyof typeof COLORS],
                backgroundColor: `${COLORS[item.priority as keyof typeof COLORS]}08`,
              }}
            >
              <div
                className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                style={{ color: COLORS[item.priority as keyof typeof COLORS] }}
              >
                {item.count}
              </div>
              <div className="text-xs sm:text-sm lg:text-sm text-slate-700 capitalize font-semibold mt-2">
                {item.priority === "high" && "🔴 High"}
                {item.priority === "medium" && "🟡 Medium"}
                {item.priority === "low" && "🟢 Low"}
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriorityDistributionChart;
