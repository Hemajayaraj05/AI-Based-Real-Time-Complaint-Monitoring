import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const data = [
  { name: "RaiseComplaints", value: 0 },
  { name: "OverallComplaints", value: 0 },
  { name: "MyComplaints", value: 0},
  { name: "AssignedToMe", value: 0},
];

const DashboardHome = () => {
  return (
    <>
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
    Complaints Overview
      </h1>

      <div className="flex justify-center">
  <div className="bg-white rounded-xl shadow-lg p-4 w-[800px] h-[320px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#7c3aed" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
    </>
  );
};

export default DashboardHome;
