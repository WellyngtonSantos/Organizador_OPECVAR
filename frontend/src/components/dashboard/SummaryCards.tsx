import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface SummaryCardsProps {
  open: number;
  completed: number;
  standBy: number;
  overdue: number;
}

interface CardConfig {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function SummaryCards({ open, completed, standBy, overdue }: SummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      label: 'Abertas',
      value: open,
      icon: <AssignmentIcon />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      label: 'Concluidas',
      value: completed,
      icon: <CheckCircleIcon />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      label: 'Stand By',
      value: standBy,
      icon: <PauseCircleIcon />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
    {
      label: 'Atrasadas',
      value: overdue,
      icon: <WarningIcon />,
      color: '#d32f2f',
      bgColor: '#ffebee',
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.label}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              borderLeft: 4,
              borderColor: card.color,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <div>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </div>
              <Paper
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: card.bgColor,
                  color: card.color,
                  display: 'flex',
                }}
              >
                {card.icon}
              </Paper>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
