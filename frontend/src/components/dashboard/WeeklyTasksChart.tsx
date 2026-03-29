import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';

interface WeeklyTasksChartProps {
  data: { day: string; received: number; completed: number }[];
}

export default function WeeklyTasksChart({ data }: WeeklyTasksChartProps) {
  const theme = useTheme();
  const labelColor = theme.palette.text.primary;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Tarefas Recebidas vs Concluidas
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="received"
            name="Recebidas"
            stroke="#42a5f5"
            strokeWidth={2}
            dot={{ r: 4 }}
          >
            <LabelList dataKey="received" position="top" fill={labelColor} fontSize={12} />
          </Line>
          <Line
            type="monotone"
            dataKey="completed"
            name="Concluidas"
            stroke="#66bb6a"
            strokeWidth={2}
            dot={{ r: 4 }}
          >
            <LabelList dataKey="completed" position="bottom" fill={labelColor} fontSize={12} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
