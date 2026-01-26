import React from "react";

type MyComplaint = {
  id: number;
  title: string;
  status: "Resolved" | "Not Resolved";
};

const myComplaints: MyComplaint[] = [
  { id: 1, title: "Wi-Fi not working", status: "Resolved" },
  { id: 2, title: "Classroom projector issue", status: "Not Resolved" },
];

const MyComplaints: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-purple-200 shadow-md p-6">
      <h2 className="text-lg font-semibold text-purple-700 mb-4">
        My Complaints
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resolved */}
        <div className="border rounded-lg p-4">
          <h3 className="text-green-600 font-medium mb-2">Resolved Issues</h3>
          <ul className="space-y-2">
            {myComplaints
              .filter((c) => c.status === "Resolved")
              .map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-gray-700 border px-3 py-1 rounded"
                >
                  {item.title}
                </li>
              ))}
          </ul>
        </div>

        {/* Not Resolved */}
        <div className="border rounded-lg p-4">
          <h3 className="text-red-600 font-medium mb-2">Not Resolved</h3>
          <ul className="space-y-2">
            {myComplaints
              .filter((c) => c.status === "Not Resolved")
              .map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-gray-700 border px-3 py-1 rounded"
                >
                  {item.title}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;
