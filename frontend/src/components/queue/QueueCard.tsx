import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { Task } from '../../types/task';
import StatusChip from '../common/StatusChip';
import PriorityChip from '../common/PriorityChip';
import { formatDate } from '../../utils/dateUtils';
import { formatHours } from '../../utils/formatters';

interface QueueCardProps {
  task: Task;
  index: number;
}

export default function QueueCard({ task, index }: QueueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        cursor: 'grab',
        '&:hover': { boxShadow: 3 },
        ...(isDragging && { boxShadow: 6 }),
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            {...attributes}
            {...listeners}
            sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled', cursor: 'grab' }}
          >
            <DragIndicatorIcon />
          </Box>

          <Typography
            variant="caption"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Typography>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {task.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <PriorityChip priority={task.priority} />
              <StatusChip status={task.status} />
              {task.bucket && (
                <Chip
                  label={task.bucket.name}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: task.bucket.color ?? '#9e9e9e',
                    color: '#fff',
                  }}
                />
              )}
              {task.estimatedCompletionDate && (
                <Typography variant="caption" color="text.secondary">
                  Prazo: {formatDate(task.estimatedCompletionDate)}
                </Typography>
              )}
              {task.estimatedHours !== null && (
                <Typography variant="caption" color="text.secondary">
                  {formatHours(task.estimatedHours)}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
