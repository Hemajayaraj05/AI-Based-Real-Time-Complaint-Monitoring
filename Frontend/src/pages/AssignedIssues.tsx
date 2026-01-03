import { useState } from "react";

/* ---------- TYPES ---------- */
interface Issue {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Resolved" | "Not Resolved";
  date: string;
}

/* ---------- MOCK DATA ---------- */
const initialIssues: Issue[] = [
  {
    id: 1,
    title: "Hostel Water Issue",
    description: "Irregular water supply in Block A hostel.",
    priority: "High",
    status: "Not Resolved",
    date: "12 Sep 2025, 10:30 AM",
  },
  {
    id: 2,
    title: "Transport Delay",
    description: "College bus delay in the evening route.",
    priority: "Medium",
    status: "Not Resolved",
    date: "11 Sep 2025, 4:10 PM",
  },
];

const AssignedIssues = () => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [showCelebration, setShowCelebration] = useState(false);

  const markResolved = (id: number) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? { ...issue, status: "Resolved" }
          : issue
      )
    );

    // 🎉 Trigger celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 sm:px-8 py-8 relative overflow-hidden">
      {/* 🎉 CONFETTI */}
      {showCelebration && <Confetti />}

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Issues Assigned To Me
        </h1>
        <p className="text-sm text-gray-600">
          Manage and resolve assigned complaints
        </p>
      </div>

      {/* ISSUE CARDS */}
      <div className="max-w-5xl mx-auto grid gap-6">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="
              bg-white
              rounded-xl
              p-5 sm:p-6
              border border-gray-200
              shadow-md
              transition-all duration-300
              hover:scale-[1.02]
              hover:shadow-xl
            "
          >
            {/* TITLE + STATUS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-medium text-slate-800">
                {issue.title}
              </h2>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium
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

            {/* META */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
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
                  Date:
                </span>{" "}
                <span className="text-gray-600">
                  {issue.date}
                </span>
              </div>
            </div>

            {/* ACTION */}
            {issue.status !== "Resolved" && (
              <div className="mt-5">
                <button
                  onClick={() => markResolved(issue.id)}
                  className="
                    px-4 py-2
                    text-sm font-medium
                    rounded-md
                    bg-blue-600 text-white
                    shadow
                    transition-all
                    hover:bg-blue-500
                    hover:shadow-lg
                    active:scale-95
                  "
                >
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- CONFETTI COMPONENT ---------- */
const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-3 rounded-sm animate-confetti"
          style={{
            left: Math.random() * 100 + "%",
            backgroundColor: randomColor(),
            animationDelay: `${Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
};

const randomColor = () =>
  ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#a855f7"][
    Math.floor(Math.random() * 5)
  ];

export default AssignedIssues;
