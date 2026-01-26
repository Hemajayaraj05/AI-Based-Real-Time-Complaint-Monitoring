import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ChartData {
  name: string;
  value: number;
}

interface Props {
  data: ChartData[];
}

const ComplaintsChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-xl shadow-lg p-4 w-200 h-80">
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
  );
};

export default ComplaintsChart;
