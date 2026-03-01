import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DivisionStat = {
  division: string;
  count: number;
};

const DivisionWiseChart: React.FC = () => {
  const [data, setData] = useState<DivisionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDivisionStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/stats/division", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (res.ok) {
          const result = await res.json();
          setData(result.stats || []);
        }
      } catch (err) {
        console.error("Failed to fetch division stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionStats();
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
    division: item.division.charAt(0).toUpperCase() + item.division.slice(1),
    count: item.count,
  }));

  return (
    <section className="w-full">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 border border-purple-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
              Division-wise Complaints
            </h2>
            <p className="text-slate-500 text-sm lg:text-base mt-1">
              Complaint distribution across divisions
            </p>
          </div>
        </div>

        <div className="mt-6 h-64 sm:h-80 lg:h-96 -mx-4 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" vertical={false} />
              <XAxis 
                dataKey="division" 
                angle={-25}
                textAnchor="end"
                height={70}
                tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }}
                axisLine={{ stroke: "#e9d5ff" }}
              />
              <YAxis 
                tick={{ fill: "#475569", fontSize: 10 }}
                axisLine={{ stroke: "#e9d5ff" }}
                width={30}
              />
              <Tooltip
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
                dataKey="count"
                name="📋 Complaints"
                fill="#a855f7"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                label={{ position: 'top', fill: '#1e293b', fontSize: 12, fontWeight: 'bold' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default DivisionWiseChart;
