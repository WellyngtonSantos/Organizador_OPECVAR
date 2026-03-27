import React from 'react';
import Chip from '@mui/material/Chip';
import { Status } from '../../types/task';
import { statusLabels, statusColors } from '../../utils/formatters';

interface StatusChipProps {
  status: Status;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  return (
    <Chip
      label={statusLabels[status]}
      size={size}
      sx={{
        backgroundColor: statusColors[status],
        color: '#fff',
        fontWeight: 500,
      }}
    />
  );
}
