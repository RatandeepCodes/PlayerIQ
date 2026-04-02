import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface MomentumChartProps {
  data: { minute: number; label?: string; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
}

const MomentumChart = ({ data, homeTeam, awayTeam }: MomentumChartProps) => {
  const values = data.flatMap((point) => [point.home, point.away]);
  const maxValue = values.length ? Math.max(...values) : 0;
  const domainMax = maxValue > 0 ? Math.ceil(maxValue + maxValue * 0.15) : 5;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid stroke="hsl(0 0% 12%)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'hsl(0 0% 45%)', fontSize: 10, fontFamily: "'Space Grotesk'" }}
          axisLine={{ stroke: 'hsl(0 0% 15%)' }}
        />
        <YAxis
          domain={[0, domainMax]}
          tick={{ fill: 'hsl(0 0% 45%)', fontSize: 10, fontFamily: "'Space Grotesk'" }}
          axisLine={{ stroke: 'hsl(0 0% 15%)' }}
        />
        <Tooltip
          labelFormatter={(value) => `Window ${value}`}
          contentStyle={{
            backgroundColor: 'hsl(0 0% 8%)',
            border: '1px solid hsl(0 0% 15%)',
            borderRadius: '8px',
            fontFamily: "'Space Grotesk'",
            fontSize: 12,
            color: 'hsl(0 0% 90%)',
          }}
        />
        <Line
          type="monotone"
          dataKey="home"
          name={homeTeam}
          stroke="hsl(0 0% 100%)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="away"
          name={awayTeam}
          stroke="hsl(0 0% 45%)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MomentumChart;
