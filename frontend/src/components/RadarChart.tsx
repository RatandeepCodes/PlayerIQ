import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarChartProps {
  data: { attribute: string; value: number; fullMark?: number }[];
  secondaryData?: { attribute: string; value: number }[];
}

const RadarChartComponent = ({ data, secondaryData }: RadarChartProps) => {
  const merged = data.map((d) => ({
    ...d,
    fullMark: d.fullMark || 100,
    secondary: secondaryData?.find((s) => s.attribute === d.attribute)?.value ?? undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={merged} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="hsl(0 0% 20%)" />
        <PolarAngleAxis
          dataKey="attribute"
          tick={{ fill: 'hsl(0 0% 55%)', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}
        />
        <Radar
          name="Player"
          dataKey="value"
          stroke="hsl(0 0% 100%)"
          fill="hsl(0 0% 100%)"
          fillOpacity={0.12}
          strokeWidth={1.5}
        />
        {secondaryData && (
          <Radar
            name="Comparison"
            dataKey="secondary"
            stroke="hsl(0 0% 50%)"
            fill="hsl(0 0% 50%)"
            fillOpacity={0.08}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        )}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
