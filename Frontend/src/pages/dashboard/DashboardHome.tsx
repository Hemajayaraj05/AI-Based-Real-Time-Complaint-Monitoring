import ComplaintsChart, {
  ChartData,
} from "../../components/dashboard/ComplaintsChart";

const data: ChartData[] = [
  { name: "RaiseComplaints", value: 0 },
  { name: "OverallComplaints", value: 0 },
  { name: "MyComplaints", value: 0 },
  { name: "AssignedToMe", value: 0 },
];

const DashboardHome: React.FC = () => {
  return (
    <>
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Complaints Overview
      </h1>
      <ComplaintsChart data={data} />
    </>
  );
};

export default DashboardHome;
