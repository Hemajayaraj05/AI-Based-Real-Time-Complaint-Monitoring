import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type ComplaintAnalysisPoint = {
  month: string;
  resolved: number;
  pending: number;
  in_progress: number;
  predicted?: boolean;
};

const tooltipFormatter = (value: number | undefined, name: string | undefined): [number, string] => {
  const safeValue = typeof value === "number" ? value : 0;
  const safeName = typeof name === "string" ? name : "";
  
  let label = "";
  if (safeName === "resolved") label = "Resolved";
  else if (safeName === "pending") label = "Pending";
  else if (safeName === "in_progress") label = "In Progress";
  
  return [safeValue, label];
};

const ComplaintAnalysisChart: React.FC = () => {
  const [chartData, setChartData] = useState<ComplaintAnalysisPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/analysis/monthly?months=10&predict=3", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (res.ok) {
          const result = await res.json();
          console.log("Monthly analysis API response:", result);
          setChartData(result.data || []);
        } else {
          console.error("API responded with status:", res.status);
          const error = await res.text();
          console.error("API error:", error);
        }
      } catch (err) {
        console.error("Failed to fetch monthly analysis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 animate-pulse border border-purple-100">
        <div className="h-6 bg-purple-200 rounded w-48 mb-6"></div>
        <div className="h-96 bg-purple-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 border border-purple-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
              Monthly Complaint Trends
            </h2>
            <p className="text-slate-500 text-sm lg:text-base mt-1">
              Status distribution per month
            </p>
          </div>
        </div>

        <div className="mt-6 h-64 sm:h-80 lg:h-[450px] -mx-4 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap={8}
              barCategoryGap={16}
              margin={{ top: 8, right: 12, left: -20, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }}
                axisLine={{ stroke: "#e9d5ff" }}
              />
              <YAxis 
                tick={{ fill: "#475569", fontSize: 10 }}
                axisLine={{ stroke: "#e9d5ff" }}
                width={30}
              />
              <Tooltip<number, string>
                formatter={tooltipFormatter}
                cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "2px solid #e9d5ff",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#1e293b", fontWeight: 600 }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: "16px" }}
                iconType="square"
              />
              <Bar
                dataKey="resolved"
                name="✓ Resolved"
                fill="#16a34a"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                label={{ position: 'top', fill: '#1e293b', fontSize: 10 }}
              />
              <Bar
                dataKey="pending"
                name="⏸ Pending"
                fill="#dc2626"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                label={{ position: 'top', fill: '#1e293b', fontSize: 10 }}
              />
              <Bar
                dataKey="in_progress"
                name="⚙ In Progress"
                fill="#d97706"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                label={{ position: 'top', fill: '#1e293b', fontSize: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default ComplaintAnalysisChart;
