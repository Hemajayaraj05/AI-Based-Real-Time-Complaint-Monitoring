import { useEffect, useState } from "react";
import { getDivisionIcon, getDivisionColor, ChevronDownIcon, LinkIcon } from "../../components/icons/IconComponents";
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
  similar_ids?: string[];
  is_primary?: boolean;
};

const AssignedIssues: React.FC = () => {
  const [issues, setIssues] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [similarComplaints, setSimilarComplaints] = useState<Record<string, Complaint[]>>({});

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:4000/api/complaints/assigned", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) {
          const p = await res.json().catch(() => ({}));
          throw new Error(p.message || "Failed to load assigned complaints");
        }
        const payload = await res.json();
        setIssues(payload.complaints || []);
      } catch (err: any) {
        setError(err.message || "Error fetching assigned issues");
      } finally {
        setLoading(false);
      }
    };

    fetchAssigned();
  }, []);

  const fetchSimilarComplaints = async (clusterId: string) => {
    if (similarComplaints[clusterId]) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:4000/api/complaints/cluster/${clusterId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch similar complaints");
      }
      
      const payload = await res.json();
      setSimilarComplaints(prev => ({
        ...prev,
        [clusterId]: payload.complaints || []
      }));
    } catch (err: any) {
      console.error("Error fetching similar complaints:", err);
    }
  };

  const handleToggleSimilar = (issue: Complaint) => {
    if (expandedId === issue.id) {
      setExpandedId(null);
    } else {
      setExpandedId(issue.id);
      if (issue.cluster_id) {
        fetchSimilarComplaints(issue.cluster_id);
      }
    }
  };

  const updateStatus = async (complaintId: string, newStatus: string) => {
    setUpdatingId(complaintId);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:4000/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const p = await res.json().catch(() => ({}));
        throw new Error(p.message || "Failed to update status");
      }

      const result = await res.json();

      if (result.cascaded > 0) {
        showToast.success(`Status updated! ${result.cascaded} similar complaints also updated.`);
      } else {
        showToast.success(result.message || "Status updated successfully!");
      }

      setIssues((prev) =>
        prev.map((issue) => {
          if (issue.id === complaintId) {
            return { ...issue, status: newStatus };
          }
          if (issue.cluster_id && result.complaint.cluster_id && 
              issue.cluster_id === result.complaint.cluster_id) {
            return { ...issue, status: newStatus };
          }
          return issue;
        })
      );

      if (result.complaint.cluster_id && similarComplaints[result.complaint.cluster_id]) {
        setSimilarComplaints(prev => ({
          ...prev,
          [result.complaint.cluster_id]: prev[result.complaint.cluster_id].map(c => 
            ({ ...c, status: newStatus })
          )
        }));
      }
    } catch (err: any) {
      showToast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityColor = (priority?: string) => {
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

  const displayIssues = issues.filter((issue, index, self) => {
    if (!issue.cluster_id) return true;
    return self.findIndex(i => i.cluster_id === issue.cluster_id) === index;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium text-lg">Loading assigned issues...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 lg:space-y-10 pt-2 lg:pt-8">
      {/* Header */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow p-6 lg:p-8 border border-purple-100">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Assigned To Me</h1>
        <p className="text-slate-500 text-base lg:text-lg">Manage and resolve complaints assigned to you</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 lg:p-6 text-red-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-5 lg:space-y-6">
        {displayIssues.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl p-12 lg:p-16 text-center border border-purple-100">
            <p className="text-slate-600 text-lg font-medium">No issues assigned to you yet</p>
            <p className="text-slate-500 text-sm mt-2">Once complaints are assigned, they'll appear here</p>
          </div>
        ) : (
          displayIssues.map((issue) => {
            const divColor = getDivisionColor(issue.division || issue.category || "other");
            return (
              <div
                key={issue.id}
                className={`bg-white rounded-xl lg:rounded-2xl shadow border-2 transition-all duration-200 hover:shadow-lg overflow-hidden ${
                  issue.similar_count && issue.similar_count > 0
                    ? "border-purple-200 bg-linear-to-br from-purple-50/40 to-white"
                    : "border-purple-100"
                }`}
              >
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                    {/* Division Icon & Content */}
                    <div className="flex gap-4 lg:gap-5 flex-1">
                      <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${divColor.bg} ${divColor.text} shadow-md`}>
                        <div className="w-7 h-7 lg:w-8 lg:h-8">
                          {getDivisionIcon(issue.division || issue.category || "other")}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 line-clamp-2">{issue.title}</h3>
                        <p className="text-slate-600 text-sm lg:text-base mb-4 line-clamp-2">{issue.description}</p>

                        <div className="flex flex-wrap gap-2 lg:gap-3 text-xs lg:text-sm">
                          <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold ${divColor.text} ${divColor.bg}`}>
                            {issue.division || issue.category}
                          </span>
                          <span className="text-slate-500 font-medium">📅 {issue.created_at?.slice(0, 10)}</span>
                          {issue.similar_count && issue.similar_count > 0 && (
                            <span className="text-purple-600 font-bold flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-lg">
                              <div className="w-4 h-4"><LinkIcon /></div>
                              {issue.similar_count} similar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                      <span className={`px-4 py-2 text-xs lg:text-sm font-bold rounded-lg ${getStatusColor(issue.status)} whitespace-nowrap`}>
                        {issue.status === "in_progress" ? "IN PROGRESS" : issue.status?.toUpperCase()}
                      </span>
                      <span className={`px-4 py-2 text-xs lg:text-sm font-bold rounded-lg ${getPriorityColor(issue.priority)} whitespace-nowrap`}>
                        {issue.priority || "Medium"} Priority
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 border-t border-purple-100 pt-6">
                    <button
                      onClick={() => updateStatus(issue.id, "pending")}
                      disabled={updatingId === issue.id}
                      className="px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⏳ Pending
                    </button>
                    <button
                      onClick={() => updateStatus(issue.id, "in_progress")}
                      disabled={updatingId === issue.id}
                      className="px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⟳ In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(issue.id, "resolved")}
                      disabled={updatingId === issue.id}
                      className="px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span>✓</span> Resolve{issue.similar_count && issue.similar_count > 0 && ` (+${issue.similar_count})`}
                    </button>
                    
                    {issue.similar_count && issue.similar_count > 0 && (
                      <button
                        onClick={() => handleToggleSimilar(issue)}
                        className="ml-auto px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <div className={`w-4 h-4 transition-transform ${expandedId === issue.id ? 'rotate-180' : ''}`}>
                          <ChevronDownIcon />
                        </div>
                        {expandedId === issue.id ? "Hide" : "Show"} Similar
                      </button>
                    )}
                  </div>

                  {/* Similar Complaints */}
                  {expandedId === issue.id && issue.cluster_id && similarComplaints[issue.cluster_id] && (
                    <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-purple-200">
                      <p className="text-sm lg:text-base font-bold text-slate-900 mb-4">🔗 Grouped Similar Complaints ({similarComplaints[issue.cluster_id].filter(c => c.id !== issue.id).length})</p>
                      <div className="space-y-3 lg:space-y-4">
                        {similarComplaints[issue.cluster_id]
                          .filter(c => c.id !== issue.id)
                          .map((similar) => (
                            <div
                              key={similar.id}
                              className="bg-purple-50 py-3 lg:py-4 px-4 lg:px-5 border-l-4 border-purple-400 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <strong className="text-sm lg:text-base text-slate-900 block">{similar.title}</strong>
                                  <p className="text-xs lg:text-sm text-slate-600 mt-1.5 line-clamp-2">
                                    {similar.description}
                                  </p>
                                  <span className="text-xs lg:text-sm text-slate-500 mt-2 block">
                                    📅 {similar.created_at?.slice(0, 10)}
                                  </span>
                                </div>
                                <span className={`px-3 py-1.5 text-xs lg:text-sm rounded-lg font-semibold whitespace-nowrap shrink-0 ${getStatusColor(similar.status)}`}>
                                  {similar.status?.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignedIssues;