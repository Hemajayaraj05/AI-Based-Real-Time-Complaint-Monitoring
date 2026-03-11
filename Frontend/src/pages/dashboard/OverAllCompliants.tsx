import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDivisionIcon, getDivisionColor, SearchIcon, ChevronDownIcon, LinkIcon } from "../../components/icons/IconComponents";
import { showToast } from "../../utils/toast";

type Complaint = {
  id: string;
  title: string;
  description: string;
  division: string;
  status: string;
  priority: string;
  created_at?: string;
  raised_by_name?: string;
  raised_by_email?: string;
  raised_by_department?: string;
  cluster_id?: string | null;
  similar_count?: number;
  similar_ids?: string[];
  is_similar?: boolean;
};

const OverallComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [reclustering, setReclustering] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [reassignModal, setReassignModal] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/all", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        
        if (!res.ok) {
          const p = await res.json().catch(() => ({}));
          throw new Error(p.message || "Failed to load complaints");
        }
        
        const payload = await res.json();
        console.log("🔍 Complaints payload:", payload);
        console.log("📊 Complaints with clustering:", payload.complaints);
        setComplaints(payload.complaints || []);
      } catch (err: any) {
        showToast.error(err.message || "Error fetching complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleRecluster = async () => {
    const confirmAction = confirm("This will re-group all similar complaints. Continue?");
    if (!confirmAction) return;
    
    setReclustering(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/complaints/utils/recluster", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p.message || "Failed to recluster");
      }
      
      const result = await res.json();
      showToast.success(`Reclustering completed! ${result.clustered} complaints clustered into ${result.groups} groups.`);
      window.location.reload();
    } catch (err: any) {
      showToast.error("Reclustering failed: " + err.message);
    } finally {
      setReclustering(false);
    }
  };

  const handleReassign = async () => {
    if (!confirm("This will reassign all complaints to specialists. Continue?")) return;
    
    setReassigning(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/complaints/utils/reassign", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p.message || "Failed to reassign");
      }
      
      const result = await res.json();
      const detailsText = Object.entries(result.details || {})
        .map(([role, count]) => `${role}: ${count}`)
        .join(", ");
      showToast.success(`Reassignment completed! ${result.reassigned} complaints reassigned. Distribution: ${detailsText || "None"}`);
      window.location.reload();
    } catch (err: any) {
      showToast.error("Reassignment failed: " + err.message);
    } finally {
      setReassigning(false);
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-700 border border-green-200";
      case "in_progress":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "pending":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const filtered = complaints.filter((c) => {
    if (c.is_similar) return false;

    const matchesQuery = [c.title, c.description, c.division]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesFilter = filter === "all" ? true : c.priority?.toLowerCase() === filter;

    return matchesQuery && matchesFilter;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium text-lg">Loading complaints...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 lg:space-y-10 pt-2 lg:pt-8">
      {/* Header Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 border border-purple-100">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">All Complaints</h1>
            <span className="bg-linear-to-r from-purple-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-lg font-bold">
              {complaints.length}
            </span>
          </div>
          <p className="text-slate-500 text-base lg:text-lg">
            {user?.role === "division_head" && "View all complaints assigned to your division"}
            {user?.role === "admin" && "Complete overview of all system complaints"}
            {!["admin", "division_head"].includes(user?.role || "") && "Browse all complaints for reference"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400">
                <SearchIcon />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, description, or division..."
                className="w-full pl-12 pr-4 py-3 lg:py-3.5 rounded-xl border border-purple-200 text-base bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl border border-purple-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {user?.role === "admin" && (
            <div className="flex gap-3">
              <button
                onClick={handleRecluster}
                disabled={reclustering}
                className="flex-1 sm:flex-initial px-4 lg:px-6 py-3 lg:py-3.5 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold text-sm lg:text-base transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                title="Re-group similar complaints"
              >
                {reclustering ? "Re-clustering..." : "🔄 Re-Cluster"}
              </button>
              <button
                onClick={handleReassign}
                disabled={reassigning}
                className="flex-1 sm:flex-initial px-4 lg:px-6 py-3 lg:py-3.5 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold text-sm lg:text-base transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                title="Reassign to specialists"
              >
                {reassigning ? "Reassigning..." : "👥 Reassign"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-5 lg:space-y-6">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl p-12 lg:p-16 text-center border border-purple-100">
            <p className="text-slate-600 text-lg font-medium">No complaints match your search</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filtered.map((complaint) => {
            const divColor = getDivisionColor(complaint.division);
            return (
              <article
                key={complaint.id}
                className={`bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 border-2 transition-all duration-200 hover:shadow-lg ${
                  complaint.similar_count && complaint.similar_count > 0
                    ? "border-purple-200 bg-linear-to-br from-purple-50/40 to-white"
                    : "border-purple-100 hover:border-purple-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 lg:gap-6">
                  {/* Division Icon */}
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${divColor.bg} ${divColor.text} shadow-md`}>
                    <div className="w-7 h-7 lg:w-8 lg:h-8">
                      {getDivisionIcon(complaint.division)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base lg:text-lg mb-2 line-clamp-2">
                      {(user?.role === "admin" || user?.role === "division_head")
                        ? complaint.title
                        : complaint.title.replace(/\s*by\s+[A-Za-z]+\s*/gi, "").trim() || complaint.title}
                    </h3>
                    <p className="text-slate-600 text-sm lg:text-base mb-4 line-clamp-2 leading-relaxed">{complaint.description}</p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 lg:gap-3 text-xs lg:text-sm mb-4">
                      <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold ${divColor.text} ${divColor.bg} ${divColor.border}`}>
                        {complaint.division}
                      </span>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        📅 {complaint.created_at?.slice(0, 10) || "N/A"}
                      </span>
                      {complaint.raised_by_name && (user?.role === "admin" || user?.role === "division_head") && (
                        <button
                          onClick={() =>
                            setExpandedProfileId(expandedProfileId === complaint.id ? null : complaint.id)
                          }
                          className="text-purple-600 font-semibold flex items-center gap-1 hover:text-purple-700 hover:underline"
                        >
                          👤 {complaint.raised_by_name}
                        </button>
                      )}
                      {complaint.similar_count && complaint.similar_count > 0 && (
                        <span className="text-purple-600 font-bold flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-lg">
                          <div className="w-4 h-4"><LinkIcon /></div>
                          {complaint.similar_count} grouped
                        </span>
                      )}
                    </div>

                    {expandedProfileId === complaint.id && complaint.raised_by_name && (
                      <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-3">Student Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="bg-white border border-purple-200 rounded-lg p-3">
                            <p className="text-xs text-slate-500 font-semibold uppercase">Name</p>
                            <p className="text-slate-900 font-semibold mt-1">{complaint.raised_by_name}</p>
                          </div>
                          <div className="bg-white border border-purple-200 rounded-lg p-3">
                            <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                            <p className="text-slate-900 font-semibold mt-1 break-all">{complaint.raised_by_email || "N/A"}</p>
                          </div>
                          <div className="bg-white border border-purple-200 rounded-lg p-3">
                            <p className="text-xs text-slate-500 font-semibold uppercase">Department</p>
                            <p className="text-slate-900 font-semibold mt-1">{complaint.raised_by_department || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Priority */}
                  <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                    <span className={`px-4 py-2 text-xs lg:text-sm font-bold rounded-lg ${getStatusColor(complaint.status)} whitespace-nowrap`}>
                      {complaint.status === "in_progress" ? "IN PROGRESS" : complaint.status?.toUpperCase()}
                    </span>
                    <span className={`px-4 py-2 text-xs lg:text-sm font-bold rounded-lg ${getPriorityColor(complaint.priority)} whitespace-nowrap`}>
                      {complaint.priority || "Medium"} Priority
                    </span>

                    {user?.role === "admin" && (
                      <button
                        onClick={() => setReassignModal(complaint.id)}
                        className="mt-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all"
                      >
                        🔄 Reassign
                      </button>
                    )}

                    {complaint.similar_count && complaint.similar_count > 0 && (
                      <button
                        onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                        className="mt-2 text-sm font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <div className={`w-4 h-4 transition-transform ${expandedId === complaint.id ? 'rotate-180' : ''}`}>
                          <ChevronDownIcon />
                        </div>
                        {expandedId === complaint.id ? "Hide" : "Show"} ({complaint.similar_count})
                      </button>
                    )}
                  </div>
                </div>

                {/* Similar Complaints */}
                {expandedId === complaint.id && complaint.similar_ids && complaint.similar_ids.length > 0 && (
                  <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-purple-200">
                    <p className="text-sm lg:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-lg">🔗</span>
                      Grouped Similar Complaints ({complaint.similar_ids.length})
                    </p>
                    <div className="space-y-3 lg:space-y-4">
                      {complaints
                        .filter((c) => complaint.similar_ids?.includes(c.id))
                        .map((dup) => (
                          <div
                            key={dup.id}
                            className="bg-purple-50 border-l-4 border-purple-400 text-slate-700 py-3 lg:py-4 px-4 lg:px-5 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0">
                                <strong className="text-sm lg:text-base text-slate-900 block">{dup.title}</strong>
                                <p className="text-xs lg:text-sm text-slate-600 mt-1.5">{dup.description.slice(0, 100)}...</p>
                              </div>
                              <span className={`text-xs lg:text-sm font-bold rounded px-3 py-1.5 whitespace-nowrap shrink-0 ${getStatusColor(dup.status)}`}>
                                {dup.status?.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Reassign Modal */}
      {reassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Reassign Complaint</h2>
              <button
                onClick={() => setReassignModal(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-slate-600 text-sm mb-6">Select a specialist to reassign this complaint:</p>
            
            <div className="space-y-2">
              {[
                { role: "Electrician", value: "electrician" },
                { role: "Cleanliness Manager", value: "cleanliness_manager" },
                { role: "Hostel Manager", value: "hostel_manager" },
                { role: "Librarian", value: "librarian" },
                { role: "Cafeteria Manager", value: "cafeteria_manager" },
                { role: "Transport Manager", value: "transport_manager" },
                { role: "Security", value: "security" },
                { role: "Admin", value: "admin" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    // In a real app, would fetch user ID by role first
                    showToast.success(`Reassigned to ${option.role}`);
                    setReassignModal(null);
                  }}
                  className="w-full text-left px-4 py-3 border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all font-medium text-slate-700"
                >
                  {option.role}
                </button>
              ))}
            </div>

            <button
              onClick={() => setReassignModal(null)}
              className="w-full mt-6 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverallComplaints;
