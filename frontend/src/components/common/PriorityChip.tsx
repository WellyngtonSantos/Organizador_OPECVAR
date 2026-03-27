import React from 'react';
import Chip from '@mui/material/Chip';
import { Priority } from '../../types/task';
import { priorityLabels, priorityColors } from '../../utils/formatters';

interface PriorityChipProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

export default function PriorityChip({ priority, size = 'small' }: PriorityChipProps) {
  return (
    <Chip
      label={priorityLabels[priority]}
      size={size}
      sx={{
        backgroundColor: priorityColors[priority],
        color: '#fff',
        fontWeight: 500,
        ...(priority === Priority.URGENT && {
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 },
          },
        }),
      }}
    />
  );
}
