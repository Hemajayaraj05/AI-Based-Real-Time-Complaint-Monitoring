import React, { useEffect, useState } from "react";
import { getDivisionIcon, getDivisionColor, CheckCircleIcon, AlertIcon } from "../../components/icons/IconComponents";
import { showToast } from "../../utils/toast";

type Complaint = {
  id: string;
  title: string;
  description: string;
  division: string;
  category?: string;
  status: string;
  priority?: string;
  created_at?: string;
  cluster_id?: string | null;
  similar_count?: number;
};

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMine = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/my", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) {
          const p = await res.json().catch(() => ({}));
          throw new Error(p.message || "Failed to load complaints");
        }
        const payload = await res.json();
        setComplaints(payload.complaints || []);
      } catch (err: any) {
        showToast.error(err.message || "Error fetching complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchMine();
  }, []);

  const resolved = complaints.filter((c) => c.status === "resolved");
  const notResolved = complaints.filter((c) => c.status !== "resolved");

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium text-lg">Loading your complaints...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 lg:space-y-10 pt-2 lg:pt-8">
      {/* Header */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 border border-purple-100">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">My Complaints</h1>
        <p className="text-slate-500 text-base lg:text-lg">Track and manage the status of your submitted complaints</p>
      </div>

      {/* In Progress / Pending */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 text-amber-600">
            <AlertIcon />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">In Progress & Pending</h2>
          <span className="ml-auto bg-amber-100 text-amber-700 px-4 py-1.5 rounded-lg font-bold text-sm md:text-base">
            {notResolved.length}
          </span>
        </div>

        {notResolved.length === 0 ? (
          <div className="bg-linear-to-br from-amber-50 to-amber-50/50 rounded-xl lg:rounded-2xl p-12 lg:p-16 text-center border-2 border-amber-200">
            <p className="text-lg lg:text-xl text-slate-600 font-medium">No pending or in-progress complaints</p>
            <p className="text-sm lg:text-base text-slate-500 mt-2">Great job! All your complaints are either resolved or well on their way.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:gap-6">
            {notResolved.map((complaint) => {
              const divColor = getDivisionColor(complaint.division || complaint.category || "other");
              const statusColor = complaint.status === "in_progress" 
                ? "bg-indigo-50/50 border-indigo-200" 
                : "bg-amber-50/50 border-amber-200";
              return (
                <div
                  key={complaint.id}
                  className={`bg-white rounded-xl lg:rounded-2xl border-2 ${statusColor} p-6 lg:p-8 hover:shadow-lg transition-all duration-200`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:gap-6 gap-4">
                    {/* Content */}
                    <div className="flex gap-4 lg:gap-5 flex-1 min-w-0">
                      <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${divColor.bg} ${divColor.text} shadow-md`}>
                        <div className="w-7 h-7 lg:w-8 lg:h-8">
                          {getDivisionIcon(complaint.division || complaint.category || "other")}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 line-clamp-2">{complaint.title}</h3>
                        <p className="text-slate-600 text-sm lg:text-base mb-4 line-clamp-2">{complaint.description}</p>

                        <div className="flex flex-wrap gap-2 lg:gap-3 text-xs lg:text-sm">
                          <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold ${divColor.text} ${divColor.bg}`}>
                            {complaint.division || complaint.category}
                          </span>
                          <span className="text-slate-500 font-medium flex items-center gap-1">📅 {complaint.created_at?.slice(0, 10)}</span>
                          {complaint.priority && (
                            <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm
                              ${complaint.priority.toLowerCase() === "high" ? "bg-red-100 text-red-700" : ""}
                              ${complaint.priority.toLowerCase() === "medium" ? "bg-amber-100 text-amber-700" : ""}
                              ${complaint.priority.toLowerCase() === "low" ? "bg-emerald-100 text-emerald-700" : ""}
                            `}>
                              {complaint.priority === "high" && "🔴"} {complaint.priority === "medium" && "🟡"} {complaint.priority === "low" && "🟢"} {complaint.priority} Priority
                            </span>
                          )}
                          {complaint.cluster_id && (
                            <span className="text-indigo-600 font-bold text-sm px-2 py-1 bg-indigo-100 rounded-lg">🔗 Grouped</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {complaint.status === "in_progress" ? (
                        <span className="px-5 py-3 lg:px-6 lg:py-3.5 bg-purple-100 text-purple-700 rounded-xl font-bold text-sm lg:text-base border border-purple-200 whitespace-nowrap">
                          ⟳ In Progress
                        </span>
                      ) : (
                        <span className="px-5 py-3 lg:px-6 lg:py-3.5 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm lg:text-base border border-amber-200 whitespace-nowrap">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 text-emerald-600">
            <CheckCircleIcon />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Resolved</h2>
          <span className="ml-auto bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-lg font-bold text-sm md:text-base">
            {resolved.length}
          </span>
        </div>

        {resolved.length === 0 ? (
          <div className="bg-linear-to-br from-emerald-50 to-emerald-50/50 rounded-xl lg:rounded-2xl p-12 lg:p-16 text-center border-2 border-emerald-200">
            <p className="text-lg lg:text-xl text-slate-600 font-medium">No resolved complaints yet</p>
            <p className="text-sm lg:text-base text-slate-500 mt-2">Once your complaints are resolved, they'll appear here and you'll be able to see the solutions.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:gap-6">
            {resolved.map((complaint) => {
              const divColor = getDivisionColor(complaint.division || complaint.category || "other");
              return (
                <div
                  key={complaint.id}
                  className="bg-white rounded-xl lg:rounded-2xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50/50 to-white p-6 lg:p-8 hover:shadow-lg transition-shadow opacity-85"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6 gap-4">
                    {/* Content */}
                    <div className="flex gap-4 lg:gap-5 flex-1 min-w-0">
                      <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${divColor.bg} ${divColor.text} shadow-md opacity-60`}>
                        <div className="w-7 h-7 lg:w-8 lg:h-8">
                          {getDivisionIcon(complaint.division || complaint.category || "other")}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 line-clamp-2 line-through opacity-75">{complaint.title}</h3>
                        <p className="text-slate-600 text-sm lg:text-base mb-4 line-clamp-2 opacity-75">{complaint.description}</p>

                        <div className="flex flex-wrap gap-2 lg:gap-3 text-xs lg:text-sm">
                          <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold ${divColor.text} ${divColor.bg}`}>
                            {complaint.division || complaint.category}
                          </span>
                          <span className="text-slate-500 font-medium">📅 {complaint.created_at?.slice(0, 10)}</span>
                          {complaint.priority && (
                            <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm
                              ${complaint.priority.toLowerCase() === "high" ? "bg-red-100 text-red-700" : ""}
                              ${complaint.priority.toLowerCase() === "medium" ? "bg-amber-100 text-amber-700" : ""}
                              ${complaint.priority.toLowerCase() === "low" ? "bg-emerald-100 text-emerald-700" : ""}
                            `}>
                              {complaint.priority === "high" && "🔴"} {complaint.priority === "medium" && "🟡"} {complaint.priority === "low" && "🟢"} {complaint.priority} Priority
                            </span>
                          )}
                          {complaint.cluster_id && (
                            <span className="text-indigo-600 font-bold text-sm px-2 py-1 bg-indigo-100 rounded-lg">🔗 Grouped</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span className="px-5 py-3 lg:px-6 lg:py-3.5 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm lg:text-base border border-emerald-200 flex items-center gap-2 whitespace-nowrap">
                        <span className="text-lg">✓</span> Resolved
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
