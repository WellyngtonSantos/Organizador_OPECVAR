import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';

interface HoursPerAnalystChartProps {
  data: { analyst: string; estimatedHours: number; actualHours: number }[];
}

export default function HoursPerAnalystChart({ data }: HoursPerAnalystChartProps) {
  const theme = useTheme();
  const labelColor = theme.palette.text.primary;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Horas por Analista
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="analyst" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => `${value}h`} />
          <Legend />
          <Bar dataKey="estimatedHours" name="Estimado" fill="#42a5f5" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="estimatedHours" position="top" fill={labelColor} fontSize={12} formatter={(v: number) => `${v}h`} />
          </Bar>
          <Bar dataKey="actualHours" name="Real" fill="#66bb6a" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="actualHours" position="top" fill={labelColor} fontSize={12} formatter={(v: number) => `${v}h`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
