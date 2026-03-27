import React from 'react';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';

interface WeekSelectorProps {
  monday: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function WeekSelector({ monday, onPrevious, onNext, onToday }: WeekSelectorProps) {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const startLabel = dayjs(monday).format('DD/MM');
  const endLabel = dayjs(friday).format('DD/MM/YYYY');

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton onClick={onPrevious} size="small">
        <ChevronLeftIcon />
      </IconButton>

      <Typography variant="h6" sx={{ minWidth: 220, textAlign: 'center' }}>
        {startLabel} - {endLabel}
      </Typography>

      <IconButton onClick={onNext} size="small">
        <ChevronRightIcon />
      </IconButton>

      <Tooltip title="Semana atual">
        <IconButton onClick={onToday} size="small" color="primary">
          <TodayIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
