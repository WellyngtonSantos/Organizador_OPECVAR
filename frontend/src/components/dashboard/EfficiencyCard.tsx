import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import SpeedIcon from '@mui/icons-material/Speed';

interface EfficiencyCardProps {
  estimated: number;
  actual: number;
  ratio: number;
}

export default function EfficiencyCard({ estimated, actual, ratio }: EfficiencyCardProps) {
  const percentage = Math.min(ratio * 100, 100);
  const color = ratio >= 0.9 ? 'success' : ratio >= 0.7 ? 'warning' : 'error';

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <SpeedIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          Eficiencia da Semana
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <div>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Horas estimadas
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {estimated}h
            </Typography>
          </Stack>
        </div>

        <div>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Horas reais
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {actual}h
            </Typography>
          </Stack>
        </div>

        <div>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Ratio (estimado/real)
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {ratio}x
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </div>
      </Stack>
    </Paper>
  );
}
