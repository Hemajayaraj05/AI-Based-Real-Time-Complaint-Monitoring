import { useState } from "react";

/* -------- TYPES -------- */
interface Issue {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Resolved" | "Not Resolved";
  date: string;
}

/* -------- MOCK DATA (as if from backend) -------- */
const mockIssues: Issue[] = [
  {
    id: 1,
    title: "Hostel Water Issue",
    description: "Water supply is irregular in Block A hostel.",
    priority: "High",
    status: "Not Resolved",
    date: "12 Sep 2025, 10:30 AM",
  },
  {
    id: 2,
    title: "Transport Delay",
    description: "College bus arrives late for evening students.",
    priority: "Medium",
    status: "Resolved",
    date: "10 Sep 2025, 4:15 PM",
  },
];

/* -------- COMPONENT -------- */
const AssignedIssues = () => {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);

  const toggleStatus = (id: number) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status:
                issue.status === "Resolved"
                  ? "Not Resolved"
                  : "Resolved",
            }
          : issue
      )
    );
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-6">
      {/* PAGE TITLE */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Issues Assigned To Me
        </h1>
        <p className="text-sm text-gray-500">
          View and manage the complaints assigned to you
        </p>
      </div>

      {/* ISSUES LIST */}
      <div className="max-w-5xl mx-auto grid gap-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="
              border border-gray-200
              rounded-lg
              p-4 sm:p-6
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            {/* TOP ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base sm:text-lg font-medium text-slate-800">
                {issue.title}
              </h2>

              <span
                className={`px-3 py-1 text-xs rounded-full w-fit
                  ${
                    issue.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                {issue.status}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-600 mt-2">
              {issue.description}
            </p>

            {/* INFO ROW */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs sm:text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  Priority:
                </span>{" "}
                <span
                  className={`font-semibold
                    ${
                      issue.priority === "High"
                        ? "text-red-600"
                        : issue.priority === "Medium"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                >
                  {issue.priority}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">
                  Date & Time:
                </span>{" "}
                <span className="text-gray-600">
                  {issue.date}
                </span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-4">
              <button
                onClick={() => toggleStatus(issue.id)}
                className="
                  text-sm
                  px-4 py-1.5
                  rounded-md
                  border
                  border-blue-600
                  text-blue-600
                  hover:bg-blue-50
                  transition
                "
              >
                {issue.status === "Resolved"
                  ? "Mark as Not Resolved"
                  : "Mark as Resolved"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedIssues;