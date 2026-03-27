import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BucketDistributionChartProps {
  data: { bucket: string; count: number; color: string }[];
}

export default function BucketDistributionChart({ data }: BucketDistributionChartProps) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Distribuicao por Bucket
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="bucket"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ bucket, count }) => `${bucket}: ${count}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, 'Tarefas']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}
