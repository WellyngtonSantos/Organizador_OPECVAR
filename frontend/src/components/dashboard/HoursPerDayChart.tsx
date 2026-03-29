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
  LabelList,
  ResponsiveContainer,
} from 'recharts';

interface HoursPerDayChartProps {
  data: { day: string; hours: number }[];
}

export default function HoursPerDayChart({ data }: HoursPerDayChartProps) {
  const theme = useTheme();
  const labelColor = theme.palette.text.primary;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Horas Trabalhadas por Dia
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => [`${value}h`, 'Horas']} />
          <Bar dataKey="hours" fill="#1976d2" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="hours" position="top" fill={labelColor} fontSize={12} formatter={(v: number) => `${v}h`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
