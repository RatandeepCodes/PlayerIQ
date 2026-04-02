import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface FormChartProps {
  data: number[];
}

const FormChart = ({ data }: FormChartProps) => {
  const chartData = data.map((v, i) => ({ match: `M${i + 1}`, rating: v }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="formGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(0 0% 12%)" strokeDasharray="3 3" />
        <XAxis
          dataKey="match"
          tick={{ fill: 'hsl(0 0% 45%)', fontSize: 10, fontFamily: "'Space Grotesk'" }}
          axisLine={{ stroke: 'hsl(0 0% 15%)' }}
        />
        <YAxis
          domain={[6, 10]}
          tick={{ fill: 'hsl(0 0% 45%)', fontSize: 10, fontFamily: "'Space Grotesk'" }}
          axisLine={{ stroke: 'hsl(0 0% 15%)' }}
        />
        <Area
          type="monotone"
          dataKey="rating"
          stroke="hsl(0 0% 100%)"
          strokeWidth={2}
          fill="url(#formGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default FormChart;
