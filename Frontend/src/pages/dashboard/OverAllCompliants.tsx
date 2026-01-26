import React from "react";

type Complaint = {
  id: number;
  title: string;
  status: "Resolved" | "Not Resolved";
};

const complaints: Complaint[] = [
  { id: 1, title: "Bus delay issue", status: "Resolved" },
  { id: 2, title: "Hostel water problem", status: "Not Resolved" },
  { id: 3, title: "Library system error", status: "Resolved" },
];

const OverallComplaints: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-purple-200 shadow-md p-6">
      <h2 className="text-lg font-semibold text-purple-700 mb-4">
        Overall Complaints
      </h2>

      <div className="space-y-3">
        {complaints.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border rounded-lg px-4 py-2"
          >
            <span className="text-gray-700">{item.title}</span>

            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                item.status === "Resolved"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverallComplaints;
