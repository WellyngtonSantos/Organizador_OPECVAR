import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HoursPerAnalystChartProps {
  data: { analyst: string; estimatedHours: number; actualHours: number }[];
}

export default function HoursPerAnalystChart({ data }: HoursPerAnalystChartProps) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Horas por Analista
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="analyst" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => `${value}h`} />
          <Legend />
          <Bar dataKey="estimatedHours" name="Estimado" fill="#42a5f5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actualHours" name="Real" fill="#66bb6a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
